"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { getProducts, Product } from "@/lib/db";

type Category = "All" | "Clothing" | "Caps" | "Rackets";
const categories: Category[] = ["All", "Clothing", "Caps", "Rackets"];
type CartItem = { id: string; name: string; image: string; price: number; qty: number };

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
  const addToCart = (p: { id: string; name: string; image: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) return prev.map((item) => item.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const totalItems = cart.reduce((a, b) => a + b.qty, 0);
  const totalPrice = cart.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "66px" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: "52px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <span className="section-label">Club Shop</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", color: "var(--color-text)", marginTop: "12px", letterSpacing: "-0.02em" }}>
            Gear Up in <span style={{ color: "var(--color-accent)" }}>Style</span>
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "12px", fontSize: "1rem" }}>
            Premium padel apparel, caps, and rackets — curated for champions.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Filter + Cart */}
        <AnimatedSection style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: activeCategory === cat ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border)",
                  background: activeCategory === cat ? "var(--color-accent-light)" : "#fff",
                  color: activeCategory === cat ? "var(--color-accent)" : "var(--color-text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {cat} {activeCategory === cat && `(${filtered.length})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: totalItems > 0 ? "var(--color-accent)" : "#fff",
              color: totalItems > 0 ? "#fff" : "var(--color-text-secondary)",
              border: `1.5px solid ${totalItems > 0 ? "var(--color-accent)" : "var(--color-border)"}`,
              padding: "9px 18px", borderRadius: "999px", cursor: "pointer",
              fontWeight: "700", fontSize: "0.85rem", transition: "all 0.2s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Cart {totalItems > 0 && `(${totalItems})`}
          </button>
        </AnimatedSection>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px", color: "var(--color-text-muted)" }}>
            Loading products...
          </div>
        ) : (
          <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }}>
                  <ProductCard 
                    id={p.id}
                    name={p.name}
                    image={p.image_url || "/images/bajupadelcewek.jpg"}
                    price={p.price}
                    category={p.category}
                    index={i} 
                    onAddToCart={addToCart} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(400px, 100vw)", background: "#fff", zIndex: 201, padding: "28px 24px", overflowY: "auto", borderLeft: "1px solid var(--color-border)", boxShadow: "-8px 0 32px rgba(0,0,0,0.08)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>Cart ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-text-secondary)", fontSize: "18px", cursor: "pointer", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "12px" }}>Cart is empty</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: "flex", gap: "12px", alignItems: "center", background: "var(--color-surface)", borderRadius: "10px", padding: "12px", border: "1px solid var(--color-border)" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "7px", overflow: "hidden", flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", marginBottom: "3px" }}>{item.name}</p>
                          <p style={{ fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: "700" }}>Rp {item.price.toLocaleString("id-ID")} × {item.qty}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "16px", cursor: "pointer", padding: "4px" }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div className="divider" style={{ marginBottom: "18px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <span style={{ color: "var(--color-text-secondary)", fontWeight: "600" }}>Total</span>
                    <span style={{ color: "var(--color-accent)", fontSize: "1.2rem", fontWeight: "900" }}>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <button className="btn-neon" style={{ width: "100%", padding: "14px", justifyContent: "center" }}>
                    Checkout (COD at Venue)
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
