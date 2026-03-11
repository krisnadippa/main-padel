"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBookingsByPhone, Booking, getCourts, getRackets, Court, Racket, parseRacketsPayload } from "@/lib/db";
import AnimatedSection from "@/components/AnimatedSection";
import Link from "next/link";

const I = {
  Search: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Court: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Racket: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

export default function CheckBookingPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [rackets, setRackets] = useState<Racket[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, r] = await Promise.all([getCourts(), getRackets()]);
        setCourts(c);
        setRackets(r);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsByPhone(phone);
      setResults(data);
      if (!data || data.length === 0) {
        setError("Tidak ada data booking ditemukan untuk nomor ini.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mencari data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return { bg: "#f0fdf4", color: "#16a34a", label: "Confirmed" };
      case "cancelled":
        return { bg: "#fef2f2", color: "#dc2626", label: "Cancelled" };
      default:
        return { bg: "#fffbeb", color: "#d97706", label: "Pending" };
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", padding: "120px 24px 80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">Riwayat Pesanan</span>
            <h1 className="section-title" style={{ marginTop: "16px", marginBottom: "20px" }}>
              Cek Status <span style={{ color: "var(--color-accent)" }}>Booking</span>
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
              Masukkan nomor WhatsApp yang Anda gunakan saat memesan untuk melihat riwayat dan status booking Anda.
            </p>
          </div>

          {/* Search Card */}
          <div style={{ 
            background: "#fff", 
            borderRadius: "24px", 
            padding: "32px", 
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
            marginBottom: "40px"
          }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "100%" }}>
                <input 
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "2px solid #f1f5f9",
                    background: "#f8fafc",
                    fontSize: "1rem",
                    color: "#0f172a",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  className="search-input"
                />
              </div>
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="btn-neon search-btn"
                  style={{ height: "56px", borderRadius: "12px", fontSize: "1rem", fontWeight: "700", justifyContent: "center" }}
                >
                  {loading ? "Mencari..." : "Cari Booking"}
                </motion.button>
              </div>
            </form>
            <style jsx>{`
              .search-input:focus { border-color: var(--color-accent) !important; background: #fff !important; }
              .search-btn { padding: 0 40px; min-width: 160px; }
              @media (max-width: 600px) {
                .search-btn { padding: 0 32px; width: 100%; max-width: 240px; }
              }
            `}</style>
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ 
                  textAlign: "center", 
                  padding: "40px", 
                  background: "#fff", 
                  borderRadius: "20px", 
                  fontWeight: "600",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <div style={{ color: "#dc2626", marginBottom: "12px" }}><I.Search /></div>
                {error}
              </motion.div>
            )}

            {results && results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Ditemukan {results.length} Booking
                </p>
                {results.map((b, idx) => {
                  const status = getStatusStyle(b.status);
                  const courtData = courts.find(c => c.id === b.court_id);
                  const racketSelections = parseRacketsPayload(b.racket_id);
                  return (
                    <motion.div 
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ 
                            width: "56px", 
                            height: "56px", 
                            borderRadius: "14px", 
                            background: "var(--color-bg-secondary)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: "var(--color-accent)",
                          }}>
                            <I.Court />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                              {courtData?.name || b.court_id.replace("lapangan", "Court ")}
                            </h3>
                            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                              {new Date(b.booking_date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {b.start_time.slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Total Bayar</p>
                            <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                              Rp {b.total_price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div style={{ 
                            padding: "6px 14px", 
                            borderRadius: "8px", 
                            fontSize: "0.75rem", 
                            fontWeight: "800", 
                            background: status.bg, 
                            color: status.color,
                            textTransform: "uppercase",
                            border: `1px solid ${status.color}20`
                          }}>
                            {status.label}
                          </div>
                        </div>
                      </div>

                      {racketSelections.length > 0 && (
                        <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <I.Racket /> Ekstra Raket
                          </p>
                          {racketSelections.map(sel => {
                            const rData = rackets.find(r => r.id === sel.id);
                            return (
                              <div key={sel.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: "600" }}>{sel.q}x {rData?.name || sel.id}</span>
                                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Rp {((rData?.price_per_hour || 0) * sel.q).toLocaleString("id-ID")}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </div>

      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <Link href="/booking" style={{ color: "var(--color-accent)", fontWeight: "600", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Kembali ke halaman booking
        </Link>
      </div>
    </div>
  );
}
