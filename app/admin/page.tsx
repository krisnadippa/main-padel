"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getBookings,
  getCourts,
  getProducts,
  getRackets,
  updateBookingStatus,
  createBooking,
  createCourt,
  updateCourt,
  deleteCourt,
  createProduct,
  updateProduct,
  deleteProduct,
  createRacket,
  updateRacket,
  deleteRacket,
  uploadImage,
  formatPhone,
  type Booking,
  type Product,
  type Court,
  type Racket,
  type RacketSelection,
  parseRacketsPayload,
} from "@/lib/db";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────
type Tab = "dashboard" | "bookings" | "courts" | "products" | "rackets";

// ── Fallback mock data (used if Supabase returns empty / error) ──
const MOCK_BOOKINGS: Booking[] = [
  { id: "BK001", customer_name: "Andi Pratama", customer_phone: "081234567890", court_id: "lapangan1", booking_date: "2026-03-11", start_time: "09:00", total_price: 175000, status: "confirmed", created_at: "2026-03-11T04:00:00Z" },
  { id: "BK002", customer_name: "Budi Santoso", customer_phone: "081234567891", court_id: "lapangan2", booking_date: "2026-03-11", start_time: "11:00", total_price: 130000, status: "confirmed", created_at: "2026-03-11T06:00:00Z" },
  { id: "BK003", customer_name: "Candra Dewi", customer_phone: "081234567892", court_id: "lapangan3", booking_date: "2026-03-12", start_time: "15:00", total_price: 140000, status: "pending", created_at: "2026-03-10T10:00:00Z" },
  { id: "BK004", customer_name: "Dian Kusumo", customer_phone: "081234567893", court_id: "lapangan1", booking_date: "2026-03-12", start_time: "18:00", total_price: 175000, status: "confirmed", created_at: "2026-03-09T08:00:00Z" },
  { id: "BK005", customer_name: "Eko Prasetyo", customer_phone: "081234567894", court_id: "lapangan2", booking_date: "2026-03-13", start_time: "20:00", total_price: 130000, status: "cancelled", created_at: "2026-03-08T12:00:00Z" },
];
const MOCK_COURTS: Court[] = [
  { id: "lapangan1", name: "Court 1 — Grand Arena", type: "Indoor", price_per_hour: 150000, status: "active" },
  { id: "lapangan2", name: "Court 2 — Pro Zone", type: "Semi-Outdoor", price_per_hour: 130000, status: "active" },
  { id: "lapangan3", name: "Court 3 — Club Court", type: "Indoor", price_per_hour: 110000, status: "maintenance" },
];
const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Women's Padel Jersey", category: "Clothing", price: 275000, stock: 24, status: "active" },
  { id: "2", name: "Men's Padel Jersey", category: "Clothing", price: 250000, stock: 18, status: "active" },
  { id: "3", name: "Padel Cap — Classic", category: "Caps", price: 120000, stock: 35, status: "active" },
  { id: "4", name: "Padel Visor — Pro", category: "Caps", price: 115000, stock: 0, status: "out_of_stock" },
];
const MOCK_RACKETS: Racket[] = [
  { id: "r1", name: "Pro Series Racket", price_per_hour: 25000, available: true },
  { id: "r2", name: "Carbon Elite Racket", price_per_hour: 30000, available: true },
];

// ── SVG Icons ─────────────────────────────────────────────────
const I = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Court: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Box: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Racket: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Revenue: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  TrendUp: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── Success Toast ─────────────────────────────────────────────
function SuccessToast({ message, type = "success", onClose }: { message: string; type?: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f172a",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontWeight: "600",
        fontSize: "0.9rem",
        border: type === "error" ? "1px solid #ef4444" : "1px solid #1e293b"
      }}
    >
      <div style={{ width: "20px", height: "20px", background: type === "error" ? "#ef4444" : "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {type === "success" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        )}
      </div>
      {message}
    </motion.div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "badge-green" },
    pending: { label: "Pending", cls: "badge-yellow" },
    cancelled: { label: "Cancelled", cls: "badge-red" },
    active: { label: "Active", cls: "badge-green" },
    maintenance: { label: "Maintenance", cls: "badge-yellow" },
    out_of_stock: { label: "Out of Stock", cls: "badge-red" },
  };
  const info = map[status] ?? { label: status, cls: "badge-yellow" };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "4px" }}>
        {label}
      </p>
      <p style={{ fontSize: "1.85rem", fontWeight: "800", color: "#0f172a", lineHeight: "1" }}>
        {value}
      </p>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px", color: "#16a34a", fontSize: "0.72rem", fontWeight: "600" }}>
          <I.TrendUp />{sub}
        </div>
      )}
    </motion.div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: "0.8rem" }}>
      <p style={{ color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#0f172a", fontWeight: "700" }}>
          {p.name}: {p.name === "Revenue" ? `Rp ${p.value.toLocaleString("id-ID")}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Data state
  const [stats, setStats] = useState<{
    totalBookings: number; todayBookings: number; totalRevenue: number;
    activeCourts: number; activeProducts: number;
    revenueByMethod?: Record<string, number>;
    trendData: { date: string; revenue: number; bookings: number }[];
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rackets, setRackets] = useState<Racket[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  
  type AdminBookingForm = {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    court_id: string;
    booking_date: string;
    start_times: string[];
    selected_rackets: RacketSelection[];
    total_price: number;
    status: "confirmed";
    payment_method: "cash" | "transfer";
  };
  
  const [addForm, setAddForm] = useState<AdminBookingForm>({ customer_name: "", customer_phone: "", customer_email: "", court_id: "lapangan1", booking_date: new Date().toISOString().split("T")[0], start_times: ["09:00"], selected_rackets: [], total_price: 150000, status: "confirmed", payment_method: "cash" });

  const getAvailableRacketStock = (racketId: string, date: string, times: string[]) => {
    if (times.length === 0) return 12;
    let maxUsed = 0;
    for (const slot of times) {
      const usedRaw = bookings
        .filter(b => b.start_time.slice(0, 5) === slot && b.booking_date === date && b.status !== "cancelled")
        .reduce((sum, b) => {
          const sels = parseRacketsPayload(b.racket_id);
          const match = sels.find(s => s.id === racketId);
          return sum + (match ? match.q : 0);
        }, 0);
      if (usedRaw > maxUsed) maxUsed = usedRaw;
    }
    return Math.max(0, 12 - maxUsed);
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if(addForm.start_times.length === 0) {
      setToast({ message: "Please select at least one time slot", type: "error" });
      return;
    }
    setAddSubmitting(true);
    try {
      const bs: Booking[] = [];
      const totalSingle = addForm.total_price / addForm.start_times.length;
      
      const totalRacketsSelected = addForm.selected_rackets.reduce((sum, r) => sum + r.q, 0);
      const racketPayload = addForm.selected_rackets.length > 0 ? JSON.stringify(addForm.selected_rackets) : undefined;
      
      for (const t of addForm.start_times) {
        const payload = {
          ...addForm,
          start_time: t,
          total_price: totalSingle,
          racket_id: racketPayload,
        };
        // @ts-ignore
        delete payload.selected_rackets;
        // @ts-ignore
        delete payload.start_times;
        
        const b = await createBooking(payload as any);
        bs.push(b);
      }
      setBookings((prev) => [...bs, ...prev]);
      setAddModalOpen(false);
      setAddForm({ customer_name: "", customer_phone: "", customer_email: "", court_id: "lapangan1", booking_date: new Date().toISOString().split("T")[0], start_times: ["09:00"], selected_rackets: [], total_price: 150000, status: "confirmed", payment_method: "cash" });
      setToast({ message: "Bookings added successfully!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save booking", type: "error" });
      console.error(err);
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── Modals State ──
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [courtModal, setCourtModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Partial<Court> }>({ open: false, mode: "add", data: {} });
  const [productModal, setProductModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Partial<Product> }>({ open: false, mode: "add", data: {} });
  const [racketModal, setRacketModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Partial<Racket> }>({ open: false, mode: "add", data: {} });
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleCourtSave = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      let finalUrl = courtModal.data.image_url;
      if (uploadFile) finalUrl = await uploadImage(uploadFile);
      const toSave = { ...courtModal.data, image_url: finalUrl };

      if (courtModal.mode === "add") {
        const nc = await createCourt(toSave);
        setCourts([nc, ...courts]);
      } else {
        const uc = await updateCourt(toSave.id!, toSave);
        setCourts(courts.map(c => c.id === uc.id ? uc : c));
      }
      setCourtModal({ open: false, mode: "add", data: {} });
      setUploadFile(null);
      setToast({ message: `Court ${courtModal.mode === "add" ? "added" : "updated"} successfully!`, type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to save court", type: "error" });
    } finally { setActionLoading(false); }
  };
  const handleCourtDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try { 
      await deleteCourt(id); 
      setCourts(courts.filter(c => c.id !== id)); 
      setToast({ message: "Court deleted successfully!", type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to delete court", type: "error" });
    }
  };

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      let finalUrl = productModal.data.image_url;
      if (uploadFile) finalUrl = await uploadImage(uploadFile);
      const toSave = { ...productModal.data, image_url: finalUrl };

      if (productModal.mode === "add") {
        const np = await createProduct(toSave);
        setProducts([np, ...products]);
      } else {
        const up = await updateProduct(toSave.id!, toSave);
        setProducts(products.map(p => p.id === up.id ? up : p));
      }
      setProductModal({ open: false, mode: "add", data: {} });
      setUploadFile(null);
      setToast({ message: `Product ${productModal.mode === "add" ? "added" : "updated"} successfully!`, type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to save product", type: "error" });
    } finally { setActionLoading(false); }
  };
  const handleProductDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try { 
      await deleteProduct(id); 
      setProducts(products.filter(p => p.id !== id)); 
      setToast({ message: "Product deleted successfully!", type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to delete product", type: "error" });
    }
  };

  const handleRacketSave = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      let finalUrl = racketModal.data.image_url;
      if (uploadFile) finalUrl = await uploadImage(uploadFile);
      const toSave = { ...racketModal.data, image_url: finalUrl };

      if (racketModal.mode === "add") {
        const nr = await createRacket(toSave);
        setRackets([nr, ...rackets]);
      } else {
        const ur = await updateRacket(toSave.id!, toSave);
        setRackets(rackets.map(r => r.id === ur.id ? ur : r));
      }
      setRacketModal({ open: false, mode: "add", data: {} });
      setUploadFile(null);
      setToast({ message: `Racket ${racketModal.mode === "add" ? "added" : "updated"} successfully!`, type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to save racket", type: "error" });
    } finally { setActionLoading(false); }
  };
  const handleRacketDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try { 
      await deleteRacket(id); 
      setRackets(rackets.filter(r => r.id !== id)); 
      setToast({ message: "Racket deleted successfully!", type: "success" });
    } catch (err: any) { 
      setToast({ message: err.message || "Failed to delete racket", type: "error" });
    }
  };

  // Load data from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, b, c, p, r] = await Promise.all([
          getDashboardStats(),
          getBookings(),
          getCourts(),
          getProducts(),
          getRackets(),
        ]);
        setStats(s);
        setBookings(b.length > 0 ? b : MOCK_BOOKINGS);
        setCourts(c.length > 0 ? c : MOCK_COURTS);
        setProducts(p.length > 0 ? p : MOCK_PRODUCTS);
        setRackets(r.length > 0 ? r : MOCK_RACKETS);
        // If stats have no trend data, use mock trend
        if (s.trendData.every((d) => d.revenue === 0 && d.bookings === 0)) {
          s.totalBookings = MOCK_BOOKINGS.length;
          s.totalRevenue = MOCK_BOOKINGS.filter(bk => bk.status !== "cancelled").reduce((sum, bk) => sum + bk.total_price, 0);
          s.activeCourts = MOCK_COURTS.filter(c => c.status === "active").length;
          s.activeProducts = MOCK_PRODUCTS.filter(p => p.status === "active").length;
          // build mock trend
          const days = ["Sen 5", "Sel 6", "Rab 7", "Kam 8", "Jum 9", "Sab 10", "Min 11"];
          s.trendData = days.map((date, i) => ({
            date,
            revenue: [130000, 280000, 150000, 320000, 175000, 440000, 305000][i],
            bookings: [1, 2, 1, 3, 1, 3, 2][i],
          }));
        }
        setStats({ ...s });
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err) || "Unknown error";
        console.error("[Supabase] Connection failed:", msg);
        setError(`Supabase error: ${msg}`);

        // Fallback to mock
        setBookings(MOCK_BOOKINGS);
        setCourts(MOCK_COURTS);
        setProducts(MOCK_PRODUCTS);
        setRackets(MOCK_RACKETS);
        const days = ["Sen 5", "Sel 6", "Rab 7", "Kam 8", "Jum 9", "Sab 10", "Min 11"];
        setStats({
          totalBookings: 5, todayBookings: 2, totalRevenue: 750000,
          activeCourts: 2, activeProducts: 3,
          trendData: days.map((date, i) => ({
            date,
            revenue: [130000, 280000, 150000, 320000, 175000, 440000, 305000][i],
            bookings: [1, 2, 1, 3, 1, 3, 2][i],
          })),
        });
      } finally {
        setLoading(false);
      }
    }
    load();

    let reloadTimeout: NodeJS.Timeout;
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        // Debounce the reload to prevent spamming if many rows insert at once
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
          load();
        }, 500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, status: Booking["status"]) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      setToast({ message: `Booking status updated to ${status}`, type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update status", type: "error" });
    }
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <I.Dashboard /> },
    { id: "bookings", label: "Bookings", icon: <I.Calendar /> },
    { id: "courts", label: "Courts", icon: <I.Court /> },
    { id: "products", label: "Products", icon: <I.Box /> },
    { id: "rackets", label: "Rackets", icon: <I.Racket /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fc", fontFamily: "var(--font-sans,'Inter',sans-serif)" }}>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "260px",
              minHeight: "100vh",
              background: "#ffffff",
              borderRight: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Logo */}
            <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid #f1f4fa" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#fff", fontSize: "15px", flexShrink: 0, boxShadow: "0 3px 10px rgba(2,132,199,0.2)" }}>
                    M
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", lineHeight: "1.1" }}>
                      Main<span style={{ color: "#0284c7" }}>Padel</span>
                    </p>
                    <p style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Bali • Admin
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <p style={{ fontSize: "0.63rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", padding: "8px 10px 4px" }}>
                Management
              </p>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "9px",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? "600" : "500",
                      color: isActive ? "#0284c7" : "#64748b",
                      background: isActive ? "#e0f2fe" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ color: isActive ? "#0284c7" : "#94a3b8", display: "flex", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User */}
            <div style={{ padding: "14px 14px 20px", borderTop: "1px solid #f1f4fa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#0284c7", fontSize: "14px", flexShrink: 0 }}>
                  A
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Admin</p>
                  <p style={{ fontSize: "0.65rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>admin@mainpadel.com</p>
                </div>
              </div>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "9px 12px", borderRadius: "8px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#dc2626", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "background 0.15s" }}>
                  <I.Logout />Logout
                </button>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <header style={{ height: "60px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", gap: "14px", background: "#fff", flexShrink: 0 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#64748b", cursor: "pointer", padding: "6px", display: "flex", transition: "all 0.15s" }}
          >
            <I.Menu />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "500" }}>Live</span>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "10px 24px", fontSize: "0.78rem", color: "#92400e" }}>
            ⚠ {error}
          </div>
        )}

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0284c7", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {!loading && activeTab === "dashboard" && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <StatCard icon={<I.Calendar />} label="Total Bookings" value={String(stats.totalBookings)} sub={`+${stats.todayBookings} today`} color="#0284c7" />
                <StatCard icon={<I.Revenue />} label="Total Revenue" value={`Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`} sub={`Cash/TRF: Rp ${( (stats.revenueByMethod?.cash || 0) + (stats.revenueByMethod?.transfer || 0) ) / 1000}K`} color="#d97706" />
                <StatCard icon={<I.Revenue />} label="Xendit Revenue" value={`Rp ${( (stats.revenueByMethod?.xendit || 0) / 1000000).toFixed(1)}M`} color="#0ea5e9" />
                <StatCard icon={<I.Court />} label="Active Courts" value={String(stats.activeCourts)} color="#16a34a" />
              </div>

              {/* Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }} className="chart-grid">

                {/* Revenue Area Chart */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>Revenue — Last 7 Days</p>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "16px" }}>Daily revenue trend</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={stats.trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${v/1000}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: "#0284c7", r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bookings Bar Chart */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>Bookings — Last 7 Days</p>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "16px" }}>Daily booking count</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="bookings" name="Bookings" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Bookings */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.9rem" }}>Recent Bookings</p>
                  <button onClick={() => setActiveTab("bookings")} style={{ background: "transparent", border: "none", color: "#0284c7", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer" }}>
                    View all →
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }} className="admin-table">
                    <thead><tr>{["ID", "Customer", "Court", "Date", "Total", "Status"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {bookings.slice(0, 4).map(b => (
                        <tr key={b.id}>
                          <td style={{ color: "#0284c7", fontFamily: "monospace", fontWeight: "700", fontSize: "0.8rem" }}>{b.id.toUpperCase().slice(0, 8)}</td>
                          <td style={{ color: "#0f172a", fontWeight: "600" }}>{b.customer_name}</td>
                          <td>{b.court_id}</td>
                          <td>{b.booking_date}</td>
                          <td style={{ color: "#0f172a", fontWeight: "700" }}>Rp {b.total_price.toLocaleString("id-ID")}</td>
                          <td>{statusBadge(b.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BOOKINGS ── */}
          {!loading && activeTab === "bookings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {/* Booking Details Modal */}
              <AnimatePresence>
                {selectedBooking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
                    onClick={() => setSelectedBooking(null)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>Booking Details</h3>
                        <button onClick={() => setSelectedBooking(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>ID</p>
                        <p style={{ fontSize: "1rem", color: "#0284c7", fontWeight: "700", fontFamily: "monospace" }}>#{selectedBooking.id?.toUpperCase()}</p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Customer</p><p style={{ fontWeight: "600", color: "#0f172a" }}>{selectedBooking.customer_name}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Phone</p><p style={{ fontWeight: "600", color: "#0f172a" }}>{formatPhone(selectedBooking.customer_phone)}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Email</p><p style={{ fontWeight: "600", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedBooking.customer_email || "—"}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Method</p><p style={{ fontWeight: "600", color: "#0f172a", textTransform: "capitalize" }}>{selectedBooking.payment_method || "xendit"}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Status</p><div>{statusBadge(selectedBooking.status)}</div></div>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Court</p><p style={{ fontWeight: "600", color: "#0f172a" }}>{courts.find(c => c.id === selectedBooking.court_id)?.name || selectedBooking.court_id}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Date</p><p style={{ fontWeight: "600", color: "#0f172a" }}>{selectedBooking.booking_date}</p></div>
                        <div><p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Time Slot</p><p style={{ fontWeight: "600", color: "#0f172a" }}>{selectedBooking.start_time}</p></div>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>Racket Rental</p>
                        {(() => {
                          const sels = parseRacketsPayload(selectedBooking.racket_id);
                          if (sels.length === 0) return <p style={{ fontWeight: "600", color: "#0f172a" }}>—</p>;
                          
                          return sels.map(sel => {
                            const rData = rackets.find(r => r.id === sel.id);
                            return (
                              <div key={sel.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "0.85rem" }}>{rData?.name}</span>
                                <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.85rem" }}>x{sel.q}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <div style={{ background: "#e0f2fe", border: "1px solid #bae6fd", padding: "16px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontWeight: "700", color: "#0369a1" }}>Total Amount</p>
                        <p style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0284c7" }}>Rp {selectedBooking.total_price.toLocaleString("id-ID")}</p>
                      </div>
                      <button className="btn-neon" style={{ width: "100%", justifyContent: "center", marginTop: "16px", padding: "12px" }} onClick={() => setSelectedBooking(null)}>Close</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Booking Modal */}
              <AnimatePresence>
                {addModalOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
                    onClick={() => setAddModalOpen(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: "#fff", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "950px", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>Manual Booking</h3>
                        <button onClick={() => setAddModalOpen(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button>
                      </div>
                      <form onSubmit={handleAddBooking}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Customer Name *</label>
                            <input className="input-dark" value={addForm.customer_name} onChange={e => setAddForm(f => ({...f, customer_name: e.target.value}))} placeholder="Full name" required />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Phone *</label>
                            <input className="input-dark" value={addForm.customer_phone} onChange={e => setAddForm(f => ({...f, customer_phone: e.target.value}))} placeholder="08xx-xxxx-xxxx" required />
                          </div>
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Email</label>
                          <input className="input-dark" type="email" value={addForm.customer_email} onChange={e => setAddForm(f => ({...f, customer_email: e.target.value}))} placeholder="(optional)" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                          <div style={{ minWidth: 0 }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Court *</label>
                            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", msOverflowStyle: "none", scrollbarWidth: "none" }}>
                            {courts.map(c => {
                              const isSelected = addForm.court_id === c.id;
                              return (
                                <div key={c.id} onClick={() => {
                                  const rPrice = addForm.selected_rackets.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                                  const newTotal = ((c.price_per_hour || 0) + rPrice) * (addForm.start_times.length || 1);
                                  setAddForm(f => ({...f, court_id: c.id, total_price: newTotal}));
                                }} style={{ flex: "0 0 160px", minHeight: "135px", display: "flex", flexDirection: "column", border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", cursor: "pointer", background: isSelected ? "#f0f9ff" : "#fff", transition: "all 0.2s ease" }}>
                                  <div style={{ height: "70px", flexShrink: 0, background: "#f1f5f9", position: "relative" }}>
                                    <img src={c.image_url || "/images/court1.jpg"} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    {isSelected && <div style={{ position: "absolute", top: "6px", right: "6px", background: "#0284c7", color: "#fff", width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>✓</div>}
                                  </div>
                                  <div style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                                    <p style={{ fontSize: "0.65rem", color: "#0284c7", fontWeight: "700" }}>Rp {c.price_per_hour.toLocaleString("id-ID")}/hr</p>
                                  </div>
                                </div>
                              );
                            })}
                            </div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Racket Rentals (Max 4)</label>
                            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", msOverflowStyle: "none", scrollbarWidth: "none" }}>
                            {rackets.map(r => {
                              const avail = getAvailableRacketStock(r.id, addForm.booking_date, addForm.start_times);
                              const selItem = addForm.selected_rackets.find(x => x.id === r.id);
                              const currentQty = selItem?.q || 0;
                              const isSelected = currentQty > 0;
                              const isAvailable = r.available && avail > 0;
                              const totalRacketsSelected = addForm.selected_rackets.reduce((sum, sr) => sum + sr.q, 0);
                              
                              return (
                                <div key={r.id} style={{ flex: "0 0 160px", minHeight: "135px", display: "flex", flexDirection: "column", border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", background: isSelected ? "#f0f9ff" : "#fff", opacity: isAvailable ? 1 : 0.6, transition: "all 0.2s ease" }}>
                                  <div style={{ height: "70px", flexShrink: 0, background: "#f1f5f9", position: "relative" }} onClick={() => {
                                    if (isAvailable && !isSelected && totalRacketsSelected < 4) {
                                        const newSel = [...addForm.selected_rackets, { id: r.id, q: 1 }];
                                        const courtData = courts.find(c => c.id === addForm.court_id);
                                        const rPrice = newSel.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                                        const newTotal = ((courtData?.price_per_hour || 0) + rPrice) * (addForm.start_times.length || 1);
                                        setAddForm(f => ({...f, selected_rackets: newSel, total_price: newTotal}));
                                    }
                                  }}>
                                    <img src={r.image_url || "/images/raket2.jpg"} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: isAvailable && !isSelected ? "pointer" : "default" }} />
                                    {isSelected && <div style={{ position: "absolute", top: "6px", right: "6px", background: "#0284c7", color: "#fff", width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>✓</div>}
                                    {!isAvailable && !isSelected && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: "bold", letterSpacing: "1px" }}>EMPTY</div>}
                                  </div>
                                  <div style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>{r.name}</p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "22px" }}>
                                      <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "500" }}>Stock: {avail}</span>
                                      {isSelected && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#e2e8f0", borderRadius: "4px", padding: "2px" }}>
                                          <button type="button" onClick={() => {
                                            let newSel;
                                            if (currentQty > 1) {
                                              newSel = addForm.selected_rackets.map(x => x.id === r.id ? { ...x, q: x.q - 1 } : x);
                                            } else {
                                              newSel = addForm.selected_rackets.filter(x => x.id !== r.id);
                                            }
                                            const courtData = courts.find(c => c.id === addForm.court_id);
                                            const rPrice = newSel.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                                            const newTotal = ((courtData?.price_per_hour || 0) + rPrice) * (addForm.start_times.length || 1);
                                            setAddForm(f => ({...f, selected_rackets: newSel, total_price: newTotal}));
                                          }} style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "2px", fontSize: "0.8rem", cursor: "pointer", color: "#0f172a" }}>-</button>
                                          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#0f172a", width: "12px", textAlign: "center" }}>{currentQty}</span>
                                          <button type="button" onClick={() => {
                                            if (totalRacketsSelected < 4 && currentQty < avail) {
                                              const newSel = addForm.selected_rackets.map(x => x.id === r.id ? { ...x, q: x.q + 1 } : x);
                                              const courtData = courts.find(c => c.id === addForm.court_id);
                                              const rPrice = newSel.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                                              const newTotal = ((courtData?.price_per_hour || 0) + rPrice) * (addForm.start_times.length || 1);
                                              setAddForm(f => ({...f, selected_rackets: newSel, total_price: newTotal}));
                                            }
                                          }} disabled={totalRacketsSelected >= 4 || currentQty >= avail} style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "2px", fontSize: "0.8rem", cursor: totalRacketsSelected >= 4 || currentQty >= avail ? "not-allowed" : "pointer", color: "#0f172a", opacity: totalRacketsSelected >= 4 || currentQty >= avail ? 0.5 : 1 }}>+</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Date *</label>
                          <input className="input-dark" type="date" value={addForm.booking_date} onChange={e => {
                              const newDate = e.target.value;
                              let newSel = [...addForm.selected_rackets];
                              
                              // Clean up over-limits when date changes
                              newSel = newSel.map(s => {
                                const avail = getAvailableRacketStock(s.id, newDate, addForm.start_times);
                                return { ...s, q: Math.min(s.q, avail) };
                              }).filter(s => s.q > 0);
                              
                              const courtData = courts.find(c => c.id === addForm.court_id);
                              const rPrice = newSel.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                              const newTotal = ((courtData?.price_per_hour || 0) + rPrice) * (addForm.start_times.length || 1);
                              
                              setAddForm(f => ({...f, booking_date: newDate, selected_rackets: newSel, total_price: newTotal}));
                          }} required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Start Time(s) *</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"].map(t => {
                                const isSel = addForm.start_times.includes(t);
                                return (
                                  <button type="button" key={t} onClick={() => {
                                    const newTimes = isSel ? addForm.start_times.filter(x => x !== t) : [...addForm.start_times, t];
                                    const courtData = courts.find(c => c.id === addForm.court_id);
                                    
                                    let newSel = [...addForm.selected_rackets];
                                    newSel = newSel.map(s => {
                                      const avail = getAvailableRacketStock(s.id, addForm.booking_date, newTimes);
                                      return { ...s, q: Math.min(s.q, avail) };
                                    }).filter(s => s.q > 0);

                                    const rPrice = newSel.reduce((a, s) => a + ((rackets.find(ra => ra.id === s.id)?.price_per_hour || 0) * s.q), 0);
                                    const newTotal = ((courtData?.price_per_hour || 0) + rPrice) * (newTimes.length || 1);
                                    setAddForm(f => ({...f, start_times: newTimes, selected_rackets: newSel, total_price: newTotal}));
                                  }} style={{ padding: "6px 10px", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer", background: isSel ? "#0284c7" : "#f1f5f9", color: isSel ? "#fff" : "#475569", border: "1px solid " + (isSel ? "#0284c7" : "#cbd5e1"), fontWeight: "600", transition: "all 0.15s" }}>{t}</button>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Total Price (Rp)</label>
                            <input className="input-dark" type="number" style={{ background: "rgba(14,187,170,0.05)", border: "1px solid rgba(14,187,170,0.2)", marginBottom: "12px" }} value={addForm.total_price} onChange={e => setAddForm(f => ({...f, total_price: Number(e.target.value)}))} />
                            
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>Payment Method *</label>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {["cash", "transfer"].map(m => (
                                <button key={m} type="button" onClick={() => setAddForm(f => ({...f, payment_method: m as any}))}
                                  style={{
                                    flex: "1 0 70px", padding: "6px 4px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "600", textTransform: "capitalize",
                                    background: addForm.payment_method === m ? "#0284c7" : "#f1f5f9",
                                    color: addForm.payment_method === m ? "#fff" : "#475569",
                                    border: "1px solid " + (addForm.payment_method === m ? "#0284c7" : "#cbd5e1"),
                                    cursor: "pointer", transition: "all 0.15s"
                                  }}>{m}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button type="submit" className="btn-neon" style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "4px", opacity: addSubmitting ? 0.7 : 1 }} disabled={addSubmitting || !addForm.court_id}>
                          {addSubmitting ? "Saving…" : "Save Booking"}
                        </button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a" }}>{bookings.length} Bookings</p>
                  <button onClick={() => setAddModalOpen(true)} className="btn-neon" style={{ padding: "7px 14px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Booking
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead><tr>{["ID", "Customer", "Phone", "Court", "Date", "Time", "Method", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ color: "#0284c7", fontFamily: "monospace", fontWeight: "700", fontSize: "0.78rem" }}>{b.id.toUpperCase().slice(0, 8)}</td>
                          <td style={{ color: "#0f172a", fontWeight: "600" }}>{b.customer_name}</td>
                          <td>{formatPhone(b.customer_phone)}</td>
                          <td>{courts.find(c => c.id === b.court_id)?.name || b.court_id}</td>
                          <td>{b.booking_date}</td>
                          <td>{b.start_time}</td>
                          <td style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "capitalize" }}>{b.payment_method || "xendit"}</td>
                          <td>{statusBadge(b.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={() => setSelectedBooking(b)} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                <I.Dashboard />Details
                              </button>
                              {b.status !== "confirmed" && (
                                <button onClick={() => handleStatusChange(b.id, "confirmed")} style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#16a34a", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <I.Check />Confirm
                                </button>
                              )}
                              {b.status !== "cancelled" && (
                                <button onClick={() => handleStatusChange(b.id, "cancelled")} style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <I.X />Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COURTS ── */}
          {!loading && activeTab === "courts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => { setUploadFile(null); setCourtModal({ open: true, mode: "add", data: { id: "lapangan" + Date.now(), name: "", type: "Indoor", price_per_hour: 150000, status: "active", image_url: "/images/lapangan1.jpg" } }); }} className="btn-neon" style={{ padding: "8px 16px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}><I.Plus />Add Court</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead><tr>{["Name", "Type", "Price/Hr", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {courts.map(c => (
                        <tr key={c.id}>
                          <td style={{ color: "#0f172a", fontWeight: "600" }}>{c.name}</td>
                          <td>{c.type}</td>
                          <td style={{ color: "#0f172a", fontWeight: "700" }}>Rp {c.price_per_hour.toLocaleString("id-ID")}/hr</td>
                          <td>{statusBadge(c.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={() => { setUploadFile(null); setCourtModal({ open: true, mode: "edit", data: c }); }} style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0284c7", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Edit />Edit</button>
                              <button onClick={() => handleCourtDelete(c.id)} style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Trash />Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Court Modal */}
              <AnimatePresence>
                {courtModal.open && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setCourtModal({ ...courtModal, open: false })}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}><h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>{courtModal.mode === "add" ? "Add Court" : "Edit Court"}</h3><button onClick={() => setCourtModal({ ...courtModal, open: false })} style={{ background: "#f1f5f9", border: "none", borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button></div>
                      <form onSubmit={handleCourtSave}>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>ID</label>
                          <input className="input-dark" value={courtModal.data.id || ""} onChange={e => setCourtModal({ ...courtModal, data: { ...courtModal.data, id: e.target.value } })} disabled={courtModal.mode === "edit"} required />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Name</label>
                          <input className="input-dark" value={courtModal.data.name || ""} onChange={e => setCourtModal({ ...courtModal, data: { ...courtModal.data, name: e.target.value } })} required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Type</label>
                            <select className="input-dark" value={courtModal.data.type || ""} onChange={e => setCourtModal({ ...courtModal, data: { ...courtModal.data, type: e.target.value } })}>
                              <option value="Indoor">Indoor</option>
                              <option value="Semi-Outdoor">Semi-Outdoor</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Price / Hr</label>
                            <input className="input-dark" type="number" value={courtModal.data.price_per_hour || 0} onChange={e => setCourtModal({ ...courtModal, data: { ...courtModal.data, price_per_hour: Number(e.target.value) } })} required />
                          </div>
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Image</label>
                          <input className="input-dark" type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                          {courtModal.data.image_url && !uploadFile && <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>Current: {courtModal.data.image_url}</p>}
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Status</label>
                          <select className="input-dark" value={courtModal.data.status || ""} onChange={e => setCourtModal({ ...courtModal, data: { ...courtModal.data, status: e.target.value as any } })}>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>
                        <button type="submit" className="btn-neon" style={{ width: "100%", justifyContent: "center" }} disabled={actionLoading}>{actionLoading ? "Saving..." : "Save"}</button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── PRODUCTS ── */}
          {!loading && activeTab === "products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => { setUploadFile(null); setProductModal({ open: true, mode: "add", data: { id: "prod" + Date.now(), name: "", category: "Clothing", price: 100000, stock: 10, status: "active", image_url: "/images/bajupadelcewek.jpg" } }); }} className="btn-neon" style={{ padding: "8px 16px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}><I.Plus />Add Product</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead><tr>{["Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td style={{ color: "#0f172a", fontWeight: "600" }}>{p.name}</td>
                          <td>
                            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: "600", color: "#475569" }}>{p.category}</span>
                          </td>
                          <td style={{ color: "#0f172a", fontWeight: "700" }}>Rp {p.price.toLocaleString("id-ID")}</td>
                          <td style={{ color: p.stock === 0 ? "#dc2626" : "#0f172a", fontWeight: "600" }}>{p.stock}</td>
                          <td>{statusBadge(p.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={() => { setUploadFile(null); setProductModal({ open: true, mode: "edit", data: p }); }} style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0284c7", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Edit />Edit</button>
                              <button onClick={() => handleProductDelete(p.id)} style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Trash />Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Modal */}
              <AnimatePresence>
                {productModal.open && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setProductModal({ ...productModal, open: false })}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}><h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>{productModal.mode === "add" ? "Add Product" : "Edit Product"}</h3><button onClick={() => setProductModal({ ...productModal, open: false })} style={{ background: "#f1f5f9", border: "none", borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button></div>
                      <form onSubmit={handleProductSave}>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>ID</label>
                          <input className="input-dark" value={productModal.data.id || ""} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, id: e.target.value } })} disabled={productModal.mode === "edit"} required />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Name</label>
                          <input className="input-dark" value={productModal.data.name || ""} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, name: e.target.value } })} required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Category</label>
                            <select className="input-dark" value={productModal.data.category || ""} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, category: e.target.value } })}>
                              <option value="Clothing">Clothing</option>
                              <option value="Caps">Caps</option>
                              <option value="Rackets">Rackets</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Price (Rp)</label>
                            <input className="input-dark" type="number" value={productModal.data.price || 0} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, price: Number(e.target.value) } })} required />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Stock</label>
                            <input className="input-dark" type="number" value={productModal.data.stock || 0} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, stock: Number(e.target.value) } })} required />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Status</label>
                            <select className="input-dark" value={productModal.data.status || ""} onChange={e => setProductModal({ ...productModal, data: { ...productModal.data, status: e.target.value as any } })}>
                              <option value="active">Active</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Image</label>
                          <input className="input-dark" type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                          {productModal.data.image_url && !uploadFile && <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>Current: {productModal.data.image_url}</p>}
                        </div>
                        <button type="submit" className="btn-neon" style={{ width: "100%", justifyContent: "center" }} disabled={actionLoading}>{actionLoading ? "Saving..." : "Save"}</button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── RACKETS ── */}
          {!loading && activeTab === "rackets" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => { setUploadFile(null); setRacketModal({ open: true, mode: "add", data: { id: "racket" + Date.now(), name: "", price_per_hour: 25000, available: true } }); }} className="btn-neon" style={{ padding: "8px 16px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}><I.Plus />Add Racket</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead><tr>{["Name", "Price/Hr", "Available", "Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {rackets.map(r => (
                        <tr key={r.id}>
                          <td style={{ color: "#0f172a", fontWeight: "600" }}>{r.name}</td>
                          <td style={{ color: "#0f172a", fontWeight: "700" }}>Rp {r.price_per_hour.toLocaleString("id-ID")}/hr</td>
                          <td>{statusBadge(r.available ? "active" : "maintenance")}</td>
                          <td>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={() => { setUploadFile(null); setRacketModal({ open: true, mode: "edit", data: r }); }} style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0284c7", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Edit />Edit</button>
                              <button onClick={() => handleRacketDelete(r.id)} style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><I.Trash />Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Racket Modal */}
              <AnimatePresence>
                {racketModal.open && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setRacketModal({ ...racketModal, open: false })}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}><h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>{racketModal.mode === "add" ? "Add Racket" : "Edit Racket"}</h3><button onClick={() => setRacketModal({ ...racketModal, open: false })} style={{ background: "#f1f5f9", border: "none", borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button></div>
                      <form onSubmit={handleRacketSave}>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>ID</label>
                          <input className="input-dark" value={racketModal.data.id || ""} onChange={e => setRacketModal({ ...racketModal, data: { ...racketModal.data, id: e.target.value } })} disabled={racketModal.mode === "edit"} required />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Name</label>
                          <input className="input-dark" value={racketModal.data.name || ""} onChange={e => setRacketModal({ ...racketModal, data: { ...racketModal.data, name: e.target.value } })} required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Price / Hr (Rp)</label>
                            <input className="input-dark" type="number" value={racketModal.data.price_per_hour || 0} onChange={e => setRacketModal({ ...racketModal, data: { ...racketModal.data, price_per_hour: Number(e.target.value) } })} required />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Available</label>
                            <select className="input-dark" value={racketModal.data.available ? "true" : "false"} onChange={e => setRacketModal({ ...racketModal, data: { ...racketModal.data, available: e.target.value === "true" } })}>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Image</label>
                          <input className="input-dark" type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                          {racketModal.data.image_url && !uploadFile && <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>Current: {racketModal.data.image_url}</p>}
                        </div>
                        <button type="submit" className="btn-neon" style={{ width: "100%", justifyContent: "center" }} disabled={actionLoading}>{actionLoading ? "Saving..." : "Save"}</button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        <AnimatePresence>
          {toast && (
            <SuccessToast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 900px) { .chart-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) { aside { position: fixed !important; z-index: 200; } }
      `}</style>
    </div>
  );
}
