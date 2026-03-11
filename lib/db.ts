import { supabase } from "./supabase";

// ── Bookings ───────────────────────────────────────────────────
export type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  racket_id?: string;
  total_price: number;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
};

export type RacketSelection = {
  id: string;
  q: number;
};

export function parseRacketsPayload(racket_id: string | null | undefined): RacketSelection[] {
  if (!racket_id) return [];
  try {
    const parsed = JSON.parse(racket_id);
    if (Array.isArray(parsed)) return parsed as RacketSelection[];
    return [];
  } catch {
    // Legacy format fallback: assume qty 1 if it's just a string ID
    return [{ id: racket_id, q: 1 }];
  }
}

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Booking[];
}

export async function getBookingsByDate(date: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", date)
    .neq("status", "cancelled");
  if (error) throw error;
  return data as Booking[];
}

export async function getBookingsByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .or(`customer_phone.eq.${normalized},customer_phone.eq.${normalized.replace(/^0/, "")}`)
    .order("booking_date", { ascending: false });
  if (error) throw error;
  return data as Booking[];
}

export async function createBooking(
  booking: Omit<Booking, "id" | "created_at">
) {
  // Normalize phone before saving
  const normalizedBooking = {
    ...booking,
    customer_phone: normalizePhone(booking.customer_phone),
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert([normalizedBooking])
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
) {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ── Courts ─────────────────────────────────────────────────────
export type Court = {
  id: string;
  name: string;
  type: string;
  price_per_hour: number;
  description?: string;
  image_url?: string;
  status: "active" | "maintenance";
};

export async function getCourts() {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as Court[];
}

// ── Products ───────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
  status: "active" | "out_of_stock";
};

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category");
  if (error) throw error;
  return data as Product[];
}

// ── Rackets ────────────────────────────────────────────────────
export type Racket = {
  id: string;
  name: string;
  price_per_hour: number;
  image_url?: string;
  available: boolean;
};

export async function getRackets() {
  const { data, error } = await supabase
    .from("rackets")
    .select("*");
  if (error) throw error;
  return data as Racket[];
}

// ── Helpers ────────────────────────────────────────────────────
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.startsWith("8")) {
    digits = "0" + digits;
  }
  return digits;
}

export function formatPhone(phone: string): string {
  return normalizePhone(phone);
}

// Supabase errors are plain objects — JSON.stringify gives readable output
function serializeError(err: unknown): string {
  if (!err) return "unknown";
  if (typeof err === "string") return err;
  try { return JSON.stringify(err); } catch { return String(err); }
}

// ── Dashboard stats ────────────────────────────────────────────
export async function getDashboardStats() {
  const [bookingsRes, courtsRes, productsRes] = await Promise.all([
    supabase.from("bookings").select("id, total_price, status, created_at"),
    supabase.from("courts").select("id, status"),
    supabase.from("products").select("id, status, stock"),
  ]);

  // Throw on first error so admin page catch() picks it up
  if (bookingsRes.error) {
    console.error("[Supabase] bookings error:", serializeError(bookingsRes.error));
    throw new Error(bookingsRes.error.message ?? serializeError(bookingsRes.error));
  }
  if (courtsRes.error) {
    console.error("[Supabase] courts error:", serializeError(courtsRes.error));
    throw new Error(courtsRes.error.message ?? serializeError(courtsRes.error));
  }
  if (productsRes.error) {
    console.error("[Supabase] products error:", serializeError(productsRes.error));
    throw new Error(productsRes.error.message ?? serializeError(productsRes.error));
  }

  const bookings = (bookingsRes.data ?? []) as { id: string; total_price: number; status: string; created_at: string }[];
  const courts = (courtsRes.data ?? []) as { id: string; status: string }[];
  const products = (productsRes.data ?? []) as { id: string; status: string; stock: number }[];

  const today = new Date().toISOString().slice(0, 10);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0);

  const todayBookings = bookings.filter(
    (b) => b.created_at?.startsWith(today)
  ).length;

  const activeCourts = courts.filter((c) => c.status === "active").length;

  const activeProducts = products.filter(
    (p) => p.status === "active" && p.stock > 0
  ).length;

  // Build last-7-days trend data
  const trendMap: Record<string, { date: string; revenue: number; bookings: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    trendMap[key] = { date: label, revenue: 0, bookings: 0 };
  }
  bookings.forEach((b) => {
    const day = b.created_at?.slice(0, 10);
    if (trendMap[day] && b.status !== "cancelled") {
      trendMap[day].revenue += b.total_price ?? 0;
      trendMap[day].bookings += 1;
    }
  });

  return {
    totalBookings: bookings.length,
    todayBookings,
    totalRevenue,
    activeCourts,
    activeProducts,
    trendData: Object.values(trendMap),
  };
}

// ── Courts Admin CRUD ───────────────────────────────────────────
export async function createCourt(court: Partial<Court>) {
  const { data, error } = await supabase.from("courts").insert([court]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateCourt(id: string, updates: Partial<Court>) {
  const { data, error } = await supabase.from("courts").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteCourt(id: string) {
  const { error } = await supabase.from("courts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Products Admin CRUD ─────────────────────────────────────────
export async function createProduct(product: Partial<Product>) {
  const { data, error } = await supabase.from("products").insert([product]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Rackets Admin CRUD ──────────────────────────────────────────
export async function createRacket(racket: Partial<Racket>) {
  const { data, error } = await supabase.from("rackets").insert([racket]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateRacket(id: string, updates: Partial<Racket>) {
  const { data, error } = await supabase.from("rackets").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteRacket(id: string) {
  const { error } = await supabase.from("rackets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Storage Admin ───────────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
