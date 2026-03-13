"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { createBooking, getCourts, getRackets, Court, Racket, getBookingsByDate, Booking, RacketSelection, parseRacketsPayload } from "@/lib/db";
import { supabase } from "@/lib/supabase";


const TIME_SLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function BookingContent() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [rackets, setRackets] = useState<Racket[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const preselectedCourt = searchParams.get("court");

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedCourt, setSelectedCourt] = useState<string | null>(preselectedCourt);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedRackets, setSelectedRackets] = useState<RacketSelection[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [bookingsForDate, setBookingsForDate] = useState<Booking[]>([]);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [xenditExternalId, setXenditExternalId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending");

  useEffect(() => {
    async function load() {
      try {
        const [c, r] = await Promise.all([getCourts(), getRackets()]);
        setCourts(c);
        setRackets(r);
      } catch (err) {
        console.error("Booking load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (preselectedCourt) setSelectedCourt(preselectedCourt);
  }, [preselectedCourt]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate) return;
      try {
        const data = await getBookingsByDate(selectedDate);
        setBookingsForDate(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }
    }
    loadSlots();
  }, [selectedDate]);

  // --- Persistent Receipt Handling ---
  useEffect(() => {
    const status = searchParams.get("status");
    const extId = searchParams.get("external_id");
    
    if (status === "success" && extId) {
      async function reconstruct() {
        try {
          const parts = (extId as string).split("|");
          if (parts[0] !== "BOOKING" || !parts[2]) return;
          
          const ids = parts[2].split(",");
          const { data: bookings, error } = await supabase
            .from("bookings")
            .select("*")
            .in("id", ids);
            
          if (error || !bookings || bookings.length === 0) return;
          
          const first = bookings[0];
          // Restore basic info
          setName(first.customer_name);
          setPhone(first.customer_phone);
          setEmail(first.customer_email || "");
          setSelectedDate(first.booking_date);
          setSelectedCourt(first.court_id);
          
          // Restore slots
          const slots = bookings.map((b: Booking) => b.start_time.slice(0, 5)).sort();
          setSelectedSlots(slots);
          
          // Restore rackets (should be same across all for one transaction)
          if (first.racket_id) {
            setSelectedRackets(parseRacketsPayload(first.racket_id));
          }
          
          // ID display
          setBookingIds(ids.map(id => id.toString().slice(0, 8).toUpperCase()));
          
          // Finish reconstruction
          setXenditExternalId(extId);
          setSubmitted(true);

          // Auto-check status if we just came back from Xendit
          if (first.status === 'pending') {
            setPaymentStatus('checking');
            // Give Xendit a moment to update status in sandbox
            setTimeout(async () => {
              try {
                const res = await fetch(`/api/payment/check-status?external_id=${extId}`);
                const data = await res.json();
                if (data.status === 'PAID' || data.status === 'SETTLED') {
                  setPaymentStatus('paid');
                } else {
                  setPaymentStatus('pending');
                }
              } catch {
                setPaymentStatus('pending');
              }
            }, 2000);
          } else {
            setPaymentStatus(first.status === 'confirmed' ? 'paid' : 'pending');
          }
        } catch (err) {
          console.error("Reconstruction error:", err);
        }
      }
      reconstruct();
    }
  }, [searchParams, courts, rackets]); 
  // ------------------------------------

  const chosenCourt = courts.find((c) => c.id === selectedCourt);
  const bookedSlots = selectedCourt 
    ? bookingsForDate.filter(b => b.court_id === selectedCourt && b.status !== 'cancelled').map(b => b.start_time.slice(0, 5))
    : [];
  
  const getAvailableRacketStock = (racketId: string) => {
    if (selectedSlots.length === 0) return 12;
    let maxUsed = 0;
    for (const slot of selectedSlots) {
      const usedRaw = bookingsForDate
        .filter(b => b.start_time.slice(0, 5) === slot && b.status !== "cancelled")
        .reduce((sum, b) => {
          const sels = parseRacketsPayload(b.racket_id);
          const match = sels.find(s => s.id === racketId);
          return sum + (match ? match.q : 0);
        }, 0);
      if (usedRaw > maxUsed) maxUsed = usedRaw;
    }
    return Math.max(0, 12 - maxUsed);
  };

  const totalHours = selectedSlots.length || 1;
  const courtPrice = (chosenCourt?.price_per_hour ?? 0) * selectedSlots.length;
  
  const totalRacketsSelected = selectedRackets.reduce((sum, r) => sum + r.q, 0);
  const racketPrice = selectedRackets.reduce((sum, sel) => {
    const racketData = rackets.find(r => r.id === sel.id);
    return sum + ((racketData?.price_per_hour ?? 0) * sel.q * selectedSlots.length);
  }, 0);
  const totalPrice = courtPrice + racketPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourt || selectedSlots.length === 0 || !name || !phone) {
      alert("Please select a court, time slot(s), and fill in your details.");
      return;
    }
    setSubmitting(true);
    try {
      const newBookings: Booking[] = [];
      const ids: string[] = [];
      
      for (const slot of selectedSlots) {
        const booking = await createBooking({
          customer_name: name,
          customer_phone: phone,
          customer_email: email || undefined,
          court_id: selectedCourt,
          booking_date: selectedDate,
          start_time: slot,
          racket_id: selectedRackets.length > 0 ? JSON.stringify(selectedRackets) : undefined,
          total_price: totalPrice,
          status: "pending",
          payment_method: "xendit",
        });
        newBookings.push(booking);
        ids.push(booking.id?.toString().slice(0, 8).toUpperCase() ?? "NEW");
      }
      
      setBookingsForDate((prev) => [...prev, ...newBookings]);
      setBookingIds(ids);

      // --- Xendit Integration ---
      try {
        const response = await fetch("/api/payment/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            customer_name: name,
            customer_email: email || undefined,
            customer_phone: phone,
            description: `Booking ${chosenCourt?.name} - ${selectedDate}`,
            booking_ids: newBookings.map(b => b.id)
          }),
        });
        
        const data = await response.json();
        if (data.invoice_url) {
          // Store invoice details and show receipt screen as requested
          setInvoiceUrl(data.invoice_url);
          setXenditExternalId(data.external_id);
          setSubmitted(true);
        } else {
          console.error("Xendit Error:", data.error);
          setSubmitted(true);
        }
      } catch (err) {
        console.error("Payment initiation failed:", err);
        setSubmitted(true);
      }
      // --------------------------
      
    } catch (error) {
      console.error("Booking error:", error);
      setBookingIds(["MANUAL"]);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort());
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "20px", padding: "56px 40px", textAlign: "center", maxWidth: "460px", width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: paymentStatus === 'paid' ? "var(--color-accent-light)" : "#FEF3C7", border: paymentStatus === 'paid' ? "2px solid var(--color-accent)" : "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: paymentStatus === 'paid' ? "var(--color-accent)" : "#B45309", fontSize: "24px", fontWeight: "700" }}>{paymentStatus === 'paid' ? "✓" : "!"}</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--color-text)", marginBottom: "10px" }}>
            {paymentStatus === 'paid' ? "Booking Confirmed!" : "Booking Reserved"}
          </h2>
          {bookingIds[0] !== "MANUAL" && <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "4px", fontFamily: "monospace" }}>ID: #{bookingIds.join(", #")}</p>}
          <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.7", marginBottom: "28px", fontSize: "0.9rem" }}>
            {paymentStatus === 'paid' 
              ? `Payment successful! Your court has been reserved. We've sent details to ${email || phone}.`
              : "Please complete your payment within 15 minutes to secure your court."}
          </p>
          <div style={{ background: "var(--color-surface)", borderRadius: "10px", padding: "18px", textAlign: "left", marginBottom: "24px", border: "1px solid var(--color-border)" }}>
            {[
              { label: "Status", value: paymentStatus === 'paid' ? "PAID" : "WAITING PAYMENT", color: paymentStatus === 'paid' ? "var(--color-accent)" : "#F59E0B" },
              { label: "Court", value: chosenCourt?.name },
              { label: "Date", value: selectedDate },
              { label: "Time", value: selectedSlots.length > 0 ? selectedSlots.join(", ") : "—" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{row.label}</span>
                <span style={{ fontSize: "0.8rem", color: (row as any).color || "var(--color-text)", fontWeight: "600" }}>{row.value}</span>
              </div>
            ))}
            {selectedRackets.length > 0 && (
              <>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "12px", marginBottom: "4px" }}>Rackets</div>
                {selectedRackets.map(sel => {
                  const rData = rackets.find(r => r.id === sel.id);
                  return (
                    <div key={sel.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", paddingLeft: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>— {rData?.name}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text)", fontWeight: "600" }}>x{sel.q}</span>
                    </div>
                  );
                })}
              </>
            )}
            <div className="divider" style={{ margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "700", color: "var(--color-text)" }}>Total</span>
              <span style={{ color: "var(--color-accent)", fontSize: "1rem", fontWeight: "900" }}>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>
          
          {paymentStatus !== 'paid' && invoiceUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <button className="btn-neon" style={{ width: "100%", justifyContent: "center", padding: "16px" }}
                onClick={() => window.open(invoiceUrl, "_blank")}>
                Pay Now (Xendit)
              </button>
              <button 
                disabled={paymentStatus === 'checking'}
                onClick={async () => {
                  setPaymentStatus('checking');
                  try {
                    const res = await fetch(`/api/payment/check-status?external_id=${xenditExternalId}`);
                    const data = await res.json();
                    if (data.status === 'PAID' || data.status === 'SETTLED') {
                      setPaymentStatus('paid');
                    } else {
                      alert("Payment not detected yet. Please ensure you have completed the payment.");
                      setPaymentStatus('pending');
                    }
                  } catch {
                    setPaymentStatus('pending');
                  }
                }}
                style={{ width: "100%", background: "none", border: "1px solid var(--color-border)", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                {paymentStatus === 'checking' ? "Checking..." : "I have paid, check status"}
              </button>
            </div>
          )}

          <button style={{ width: "100%", background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => { setSubmitted(false); setSelectedCourt(null); setSelectedSlots([]); setSelectedRackets([]); setName(""); setPhone(""); setEmail(""); setPaymentStatus('pending'); }}>
            Book Another Court
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "66px" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: "48px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <span className="section-label">Reservations</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", color: "var(--color-text)", marginTop: "12px", letterSpacing: "-0.02em" }}>
            Book Your <span style={{ color: "var(--color-accent)" }}>Court</span>
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "10px", fontSize: "0.95rem" }}>
            Select your date, court, and time slot to reserve your game.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }} className="booking-grid">

          {/* Left: Steps */}
          <div>
            {/* Step 1 */}
            <AnimatedSection style={{ marginBottom: "24px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Step 1 — Select Date
                </h3>
                <input
                  type="date" value={selectedDate} min={getTodayDate()}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlots([]); }}
                  className="input-dark" style={{ maxWidth: "260px" }}
                />
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection delay={0.05} style={{ marginBottom: "24px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Step 2 — Select Court
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                  {loading ? (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Loading courts...</div>
                  ) : (
                    courts.map((court) => {
                      const isMaintenance = court.status === "maintenance";
                      return (
                        <motion.div key={court.id} whileHover={{ y: isMaintenance ? 0 : -3 }} whileTap={{ scale: isMaintenance ? 1 : 0.98 }}
                          onClick={() => { 
                            if (!isMaintenance) {
                              setSelectedCourt(court.id); 
                              setSelectedSlots([]); 
                            }
                          }}
                          style={{
                            border: selectedCourt === court.id ? "2px solid var(--color-accent)" : "1.5px solid var(--color-border)",
                            borderRadius: "12px", overflow: "hidden", cursor: isMaintenance ? "not-allowed" : "pointer",
                            background: selectedCourt === court.id ? "var(--color-accent-light)" : "#fff",
                            transition: "all 0.15s ease",
                            opacity: isMaintenance ? 0.6 : 1,
                          }}>
                          <div style={{ position: "relative", height: "120px" }}>
                            <Image src={court.image_url || "/images/lapangan1.jpg"} alt={court.name} fill style={{ objectFit: "cover", filter: selectedCourt === court.id ? "brightness(1)" : "brightness(0.85)" }} />
                            {selectedCourt === court.id && (
                              <div style={{ position: "absolute", top: "8px", right: "8px", background: "var(--color-accent)", color: "#fff", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>✓</div>
                            )}
                            {isMaintenance && (
                               <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "0.7rem", textAlign: "center", padding: "10px" }}>MAINTENANCE</div>
                            )}
                          </div>
                          <div style={{ padding: "12px" }}>
                            <p style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text)", marginBottom: "3px" }}>{court.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "6px" }}>{isMaintenance ? "Temporarily closed for maintenance." : court.description}</p>
                            <p style={{ fontSize: "0.875rem", color: "var(--color-accent)", fontWeight: "700" }}>Rp {court.price_per_hour.toLocaleString("id-ID")}/hr</p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection delay={0.1} style={{ marginBottom: "24px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Step 3 — Select Time Slot
                </h3>
                {!selectedCourt ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Please select a court first.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
                      {[
                        { color: "var(--color-accent-light)", border: "rgba(2,132,199,0.3)", label: "Available" },
                        { color: "var(--color-accent)", border: "var(--color-accent)", label: "Selected" },
                        { color: "var(--color-surface)", border: "var(--color-border)", label: "Booked" },
                      ].map(s => (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: s.color, border: `1px solid ${s.border}` }} />
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: "7px" }}>
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlots.includes(slot);
                        return (
                          <button key={slot} disabled={isBooked} onClick={() => toggleSlot(slot)}
                            style={{
                              padding: "9px 6px", borderRadius: "7px", fontSize: "0.78rem", fontWeight: "600",
                              cursor: isBooked ? "not-allowed" : "pointer", transition: "all 0.15s ease",
                              ...(isBooked
                                ? { background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", textDecoration: "line-through" }
                                : isSelected
                                  ? { background: "var(--color-accent)", border: "1px solid var(--color-accent)", color: "#fff" }
                                  : { background: "var(--color-accent-light)", border: "1px solid rgba(2,132,199,0.25)", color: "var(--color-accent)" }
                              ),
                            }}>{slot}</button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </AnimatedSection>

            {/* Step 4 — Racket */}
            <AnimatedSection delay={0.15} style={{ marginBottom: "24px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 4 — Racket Rental (Optional)</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>Add a racket rental to your booking.</p>
                <div className="racket-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {loading ? (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Loading rackets...</div>
                  ) : (
                    rackets.map((r) => {
                      const availableStock = getAvailableRacketStock(r.id);
                      const isAvailable = r.available && availableStock > 0;
                      const selItem = selectedRackets.find(x => x.id === r.id);
                      const currentQty = selItem?.q || 0;
                      const isSelected = currentQty > 0;
                      
                      return (
                      <motion.div key={r.id} whileHover={{ y: isAvailable ? -4 : 0 }} whileTap={{ scale: isAvailable ? 0.98 : 1 }}
                        onClick={() => { 
                          if (isAvailable && !isSelected && totalRacketsSelected < 4) {
                            setSelectedRackets([...selectedRackets, { id: r.id, q: 1 }]);
                          } else if (isSelected) {
                            setSelectedRackets(selectedRackets.filter(x => x.id !== r.id));
                          }
                        }}
                        style={{
                          border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                          borderRadius: "16px", overflow: "hidden", cursor: isAvailable ? "pointer" : "not-allowed",
                          background: "#fff",
                          transition: "all 0.15s ease",
                          opacity: isAvailable ? 1 : 0.6,
                          boxShadow: isSelected ? "0 8px 24px rgba(14,187,170,0.15)" : "none",
                        }}>
                        <div style={{ position: "relative", height: "180px", borderBottom: "1px solid var(--color-border)" }}>
                          <Image src={r.image_url || "/images/raket2.jpg"} alt={r.name} fill style={{ objectFit: "cover", transition: "filter 0.3s ease", filter: isSelected ? "brightness(1.05)" : "brightness(0.95)" }} />
                          {isSelected && (
                            <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--color-accent)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>✓</div>
                          )}
                          {!isAvailable && (
                               <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.8rem", zIndex: 10 }}>OUT OF STOCK</div>
                          )}
                        </div>
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ minHeight: "2.8rem" }}>
                            <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-text)", marginBottom: "4px", lineHeight: "1.3" }}>{r.name}</p>
                            {!isSelected && isAvailable && (
                               <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{availableStock} rackets available</p>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "auto" }}>
                            <p style={{ fontSize: "1.05rem", color: "var(--color-accent)", fontWeight: "800" }}>Rp {r.price_per_hour.toLocaleString("id-ID")}<span style={{ fontSize: "0.75rem", fontWeight: "500", opacity: 0.8 }}>/hr</span></p>
                            
                            {isSelected && isAvailable && (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--color-surface)", borderRadius: "10px", padding: "4px 8px", border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => {
                                  if (currentQty > 1) setSelectedRackets(selectedRackets.map(x => x.id === r.id ? { ...x, q: x.q - 1 } : x));
                                  else setSelectedRackets(selectedRackets.filter(x => x.id !== r.id));
                                }} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", color: "var(--color-text)", fontWeight: "700", fontSize: "1.1rem" }}>−</button>
                                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-text)", width: "16px", textAlign: "center" }}>{currentQty}</span>
                                <button type="button" onClick={() => {
                                  if (totalRacketsSelected < 4 && currentQty < availableStock) {
                                    setSelectedRackets(selectedRackets.map(x => x.id === r.id ? { ...x, q: x.q + 1 } : x));
                                  }
                                }} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", color: "var(--color-text)", fontWeight: "700", fontSize: "1.1rem", opacity: (totalRacketsSelected >= 4 || currentQty >= availableStock) ? 0.3 : 1 }}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )})
                  )}
                </div>
              </div>
            </AnimatedSection>

            {/* Step 5 — Details */}
            <AnimatedSection delay={0.2}>
              <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 5 — Your Details</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name *</label>
                      <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone *</label>
                      <input className="input-dark" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 8xx xxxx xxxx" required />
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email (Optional)</label>
                    <input className="input-dark" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="btn-neon"
                    style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "0.95rem", opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                    {submitting ? "Confirming…" : "Confirm Booking"}
                  </motion.button>
                </form>
              </div>
            </AnimatedSection>
          </div>

          {/* Right: Summary */}
          <div>
            <div style={{ position: "sticky", top: "82px" }}>
              <AnimatedSection direction="right">
                <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-accent)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Booking Summary</h3>
                  {chosenCourt ? (
                    <div style={{ position: "relative", height: "130px", borderRadius: "9px", overflow: "hidden", marginBottom: "16px" }}>
                      <Image src={chosenCourt.image_url || "/images/lapangan1.jpg"} alt={chosenCourt.name} fill style={{ objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ height: "130px", borderRadius: "9px", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "1.5px dashed var(--color-border)" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>No court selected</span>
                    </div>
                  )}

                  {[
                    { label: "Date", value: selectedDate },
                    { label: "Court", value: chosenCourt?.name ?? "—" },
                    { label: "Time", value: selectedSlots.length > 0 ? selectedSlots.join(", ") : "—" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{row.label}</span>
                      <span style={{ color: "var(--color-text)", fontSize: "0.8rem", fontWeight: "600", textAlign: "right", maxWidth: "180px" }}>{row.value}</span>
                    </div>
                  ))}

                  {selectedRackets.length > 0 && (
                    <>
                      <div className="divider" style={{ margin: "5px 0" }} />
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Selected Rackets</div>
                      {selectedRackets.map(sel => {
                        const rData = rackets.find(r => r.id === sel.id);
                        return (
                          <div key={sel.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ color: "var(--color-text)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "8px" }}>{sel.q}x {rData?.name}</span>
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", flexShrink: 0 }}>Rp {((rData?.price_per_hour ?? 0) * sel.q * totalHours).toLocaleString("id-ID")}</span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div className="divider" style={{ margin: "14px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Court ({totalHours} hr)</span>
                    <span style={{ color: "var(--color-text)", fontSize: "0.8rem" }}>Rp {courtPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="divider" style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ color: "var(--color-text)", fontWeight: "700" }}>Total</span>
                    <span style={{ color: "var(--color-accent)", fontSize: "1.2rem", fontWeight: "900" }}>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>

                  <div style={{ padding: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "9px" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                      Payment at the venue.<br />Cancellation up to 2 hours before.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .booking-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { .racket-grid { grid-template-columns: 1fr !important; } }

      `}</style>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--color-text-muted)" }}>Loading…</div></div>}>
      <BookingContent />
    </Suspense>
  );
}
