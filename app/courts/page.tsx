"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { useState, useEffect } from "react";
import { getCourts, Court } from "@/lib/db";


export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourts();
        setCourts(data);
      } catch (err) {
        console.error("Fetch courts error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "66px" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: "52px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <span className="section-label">Our Facilities</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", color: "var(--color-text)", marginTop: "12px", letterSpacing: "-0.02em" }}>
            Premium <span style={{ color: "var(--color-accent)" }}>Courts</span>
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "12px", fontSize: "1rem", maxWidth: "500px", lineHeight: "1.7" }}>
            Championship-grade facilities designed for every level — from first-timers to seasoned competitors.
          </p>
        </div>
      </div>

      {/* Courts List */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px", color: "var(--color-text-muted)" }}>
              Loading facilities...
            </div>
          ) : (
            courts.map((court, i) => {
              const isMaintenance = court.status === "maintenance";
              const features = court.description?.split(",").map(f => f.trim()) || ["Championship Surface", "LED Lighting"];
              
              return (
                <AnimatedSection key={court.id} delay={i * 0.1}>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid var(--color-border)",
                      borderRadius: "20px",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.3s ease",
                      opacity: isMaintenance ? 0.9 : 1
                    }}
                    className="court-card"
                  >
                    <div
                      style={{
                        position: "relative",
                        minHeight: "320px",
                        order: i % 2 === 0 ? 1 : 2,
                      }}
                      className="court-detail-img"
                    >
                      <Image src={court.image_url || "/images/lapangan1.jpg"} alt={court.name} fill style={{ objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "14px", left: "14px", background: isMaintenance ? "#ef4444" : "var(--color-accent)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "700" }}>
                        {isMaintenance ? "MAINTENANCE" : court.type || "Indoor"}
                      </div>
                    </div>

                    <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", order: i % 2 === 0 ? 2 : 1, opacity: isMaintenance ? 0.7 : 1 }}>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-text)", marginBottom: "10px" }}>{court.name}</h2>
                      <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.8", marginBottom: "24px", fontSize: "0.9rem" }}>{court.description || "No description provided."}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                        {[
                          { label: "Surface", value: "Artificial Grass" },
                          { label: "Lighting", value: "Pro LED" },
                          { label: "Capacity", value: "4 Players" },
                          { label: "Type", value: court.type || "Standard" },
                        ].map((spec) => (
                          <div key={spec.label} style={{ background: "var(--color-surface)", borderRadius: "8px", padding: "10px 14px", border: "1px solid var(--color-border)" }}>
                            <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{spec.label}</p>
                            <p style={{ fontSize: "0.875rem", color: "var(--color-text)", fontWeight: "600" }}>{spec.value}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "28px" }}>
                        {features.slice(0, 4).map((f) => (
                          <span key={f} style={{ background: "var(--color-accent-light)", border: "1px solid rgba(2,132,199,0.2)", color: "var(--color-accent)", padding: "4px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600" }}>
                            ✓ {f}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "3px" }}>Starting from</p>
                          <p style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-accent)" }}>
                            Rp {court.price_per_hour.toLocaleString("id-ID")}<span style={{ fontSize: "0.875rem", fontWeight: "400", color: "var(--color-text-muted)" }}>/hr</span>
                          </p>
                        </div>
                        <Link href={isMaintenance ? "#" : `/booking?court=${court.id}`}>
                          <motion.button 
                            whileHover={{ scale: isMaintenance ? 1 : 1.04 }} 
                            whileTap={{ scale: isMaintenance ? 1 : 0.96 }} 
                            className={isMaintenance ? "btn-outline" : "btn-neon"}
                            disabled={isMaintenance}
                            style={{ cursor: isMaintenance ? "not-allowed" : "pointer", opacity: isMaintenance ? 0.6 : 1 }}
                          >
                            {isMaintenance ? "Unavailable" : "Book This Court"}
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", borderTop: "1px solid var(--color-border)" }}>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px", fontSize: "0.95rem" }}>Need a specific court or have questions?</p>
        <a href="tel:+628112345678">
          <button className="btn-outline">Call Us</button>
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .court-card { grid-template-columns: 1fr !important; }
          .court-detail-img { min-height: 220px !important; order: 1 !important; }
          .court-card > div:last-child { order: 2 !important; padding: 24px !important; }
        }
        .court-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  );
}
