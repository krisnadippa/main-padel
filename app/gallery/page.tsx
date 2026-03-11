"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { useState } from "react";

const allImages = [
  { src: "/images/foto1.jpg", label: "Club Atmosphere" },
  { src: "/images/foto2.jpg", label: "Championship Court" },
  { src: "/images/foto3.jpg", label: "Evening Sessions" },
  { src: "/images/foto4.jpg", label: "Pro Match" },
  { src: "/images/foto5.jpg", label: "Training Day" },
  { src: "/images/foto6.jpg", label: "Grand Arena" },
  { src: "/images/foto7.jpg", label: "Weekend League" },
  { src: "/images/lapangan1.jpg", label: "Court 1 — Grand Arena" },
  { src: "/images/lapangan2.jpg", label: "Court 2 — Pro Zone" },
  { src: "/images/lapangan3.jpg", label: "Court 3 — Club Court" },
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "70px" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: "60px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <span className="section-label">Gallery</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "900", color: "var(--color-text)", marginTop: "12px", letterSpacing: "-0.02em" }}>
            Experience the <span style={{ color: "var(--color-accent)" }}>Arena</span>
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "12px", fontSize: "1rem" }}>
            Glimpse into the world of MainPadel Club.
          </p>
        </div>
      </div>

      {/* Masonry-ish Grid */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            columns: "3 300px",
            columnGap: "16px",
          }}
        >
          {allImages.map((img, i) => (
            <AnimatedSection key={img.src} delay={i * 0.05}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(img.src)}
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "16px",
                  cursor: "pointer",
                  breakInside: "avoid",
                  height: i % 3 === 0 ? "300px" : "220px",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  style={{ objectFit: "cover", transition: "transform 0.5s ease, filter 0.3s ease", filter: "brightness(0.8)" }}
                  className="gallery-grid-img"
                />
                <div
                  className="gallery-grid-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "600" }}>{img.label}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{ position: "relative", maxWidth: "900px", width: "100%", maxHeight: "80vh", borderRadius: "16px", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={lightbox} alt="Gallery" fill style={{ objectFit: "contain" }} />
          </motion.div>
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "fixed", top: "24px", right: "24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: "44px", height: "44px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
        </motion.div>
      )}

      <style>{`
        .gallery-grid-img:hover { transform: scale(1.05) !important; filter: brightness(1) !important; }
        *:hover > .gallery-grid-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
