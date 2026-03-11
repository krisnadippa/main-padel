"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CourtCardProps {
  id: string;
  name: string;
  image: string;
  pricePerHour: number;
  description?: string;
  status?: "active" | "maintenance";
  index?: number;
}

export default function CourtCard({ id, name, image, pricePerHour, description, status = "active", index = 0 }: CourtCardProps) {
  const isMaintenance = status === "maintenance";
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
          className="court-img"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: isMaintenance ? "rgba(220, 38, 38, 0.9)" : "var(--color-accent)",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10
          }}
        >
          {isMaintenance ? "MAINTENANCE" : "AVAILABLE"}
        </div>
      </div>
      <div style={{ padding: "20px", opacity: isMaintenance ? 0.75 : 1 }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)", marginBottom: "8px" }}>
          {name}
        </h3>
        {description && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
            {description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>per hour</span>
            <p style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-accent)" }}>
              Rp {pricePerHour.toLocaleString("id-ID")}
            </p>
          </div>
          <Link href={isMaintenance ? "#" : `/booking?court=${id}`}>
            <button 
              className={isMaintenance ? "btn-outline" : "btn-neon"} 
              style={{ padding: "10px 20px", fontSize: "0.8rem", opacity: isMaintenance ? 0.6 : 1, cursor: isMaintenance ? "not-allowed" : "pointer" }}
              disabled={isMaintenance}
            >
              {isMaintenance ? "Unavailable" : "Book Now"}
            </button>
          </Link>
        </div>
      </div>
      <style>{`.court-img:hover { transform: scale(1.05); }`}</style>
    </motion.div>
  );
}
