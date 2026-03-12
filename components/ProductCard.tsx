"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  index?: number;
  onAddToCart?: (product: { id: string; name: string; image: string; price: number }) => void;
}

export default function ProductCard({
  id,
  name,
  image,
  price,
  category,
  index = 0,
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (onAddToCart) onAddToCart({ id, name, image, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "260px",
          overflow: "hidden",
          background: "var(--color-surface)",
        }}
      >
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
          className="product-img"
        />
        {category && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              color: "var(--color-text-secondary)",
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "1px solid var(--color-border)",
            }}
          >
            {category}
          </div>
        )}
        {/* Hover overlay with quick add */}
        <div
          className="product-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Quick View
          </span>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <h3
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "var(--color-text)",
            marginBottom: "8px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-accent)" }}>
            Rp {price.toLocaleString("id-ID")}
          </p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            style={{
              background: added ? "var(--color-accent-light)" : "var(--color-surface)",
              border: `1px solid ${added ? "var(--color-accent)" : "var(--color-border)"}`,
              color: added ? "var(--color-accent)" : "var(--color-text-secondary)",
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {added ? "✓ Added" : "+ Cart"}
          </motion.button>
        </div>
      </div>
      <style>{`
        .product-img { filter: brightness(0.95); }
        *:hover > .product-img { transform: scale(1.06); }
        *:hover > .product-overlay { opacity: 1 !important; }
      `}</style>
    </motion.div>
  );
}
