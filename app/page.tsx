"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import CourtCard from "@/components/CourtCard";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { getCourts, getRackets, getProducts, getDashboardStats, Court, Racket, Product } from "@/lib/db";

const galleryImages = [
  "/images/foto1.jpg",
  "/images/foto2.jpg",
  "/images/foto3.jpg",
  "/images/foto4.jpg",
  "/images/foto5.jpg",
  "/images/foto6.jpg",
  "/images/foto7.jpg",
];

export default function HomePage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [rackets, setRackets] = useState<Racket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState([
    { label: "Courts Available", value: "..." },
    { label: "Happy Members", value: "500+" },
    { label: "Years of Excellence", value: "5+" },
    { label: "Games Played", value: "10K+" },
  ]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: string; name: string; image: string; price: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, r, p, s] = await Promise.all([
          getCourts(),
          getRackets(),
          getProducts(),
          getDashboardStats(),
        ]);
        setCourts(c.slice(0, 3)); // Only show top 3 on home
        setRackets(r.slice(0, 2)); // Only show 2 on home
        
        // Select up to 5 products from distinct categories
        const featuredProducts = [];
        const seenCategories = new Set();
        for (const prod of p) {
          if (!seenCategories.has(prod.category)) {
            featuredProducts.push(prod);
            seenCategories.add(prod.category);
          }
          if (featuredProducts.length === 5) break;
        }
        // Fill the rest if there are fewer than 5 categories
        if (featuredProducts.length < 5) {
          for (const prod of p) {
            if (!featuredProducts.find((fp) => fp.id === prod.id)) {
              featuredProducts.push(prod);
            }
            if (featuredProducts.length === 5) break;
          }
        }
        setProducts(featuredProducts);
        setStats([
          { label: "Courts Available", value: s.activeCourts.toString() },
          { label: "Happy Members", value: "500+" },
          { label: "Years of Excellence", value: "5+" },
          { label: "Games Played", value: "10K+" },
        ]);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addToCart = (p: { id: string; name: string; image: string; price: number }) => {
    setCart((prev) => [...prev, p]);
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/lapangan1.jpg"
            alt="Main Padel Court"
            fill
            style={{ objectFit: "cover", filter: "brightness(0.3)" }}
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, rgba(14,187,170,0.04) 100%)",
          }}
        />

        {/* Decorative ambient glows */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,187,170,0.07) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,168,56,0.05) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            paddingTop: "100px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(14,187,170,0.08)",
                border: "1px solid rgba(14,187,170,0.22)",
                padding: "6px 14px",
                borderRadius: "999px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              <span style={{ color: "var(--color-accent)", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Premium Padel Club — Bali
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                fontWeight: "900",
                lineHeight: "1.0",
                letterSpacing: "-0.03em",
                marginBottom: "24px",
                color: "#fff",
              }}
            >
              PLAY LIKE A<br />
              <span style={{ color: "var(--color-accent)" }}>
                CHAMPION
              </span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "rgba(255,255,255,0.6)",
                maxWidth: "500px",
                lineHeight: "1.7",
                marginBottom: "40px",
              }}
            >
              Book premium padel courts, rent top-tier rackets, and gear up at our exclusive club shop. 
              Your next great game starts here.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/booking">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-neon pulse-glow"
                  style={{ padding: "16px 36px", fontSize: "0.95rem", borderRadius: "10px" }}
                >
                  Book a Court Now
                </motion.button>
              </Link>
              <Link href="/courts">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-outline"
                  style={{ padding: "16px 36px", fontSize: "0.95rem", borderRadius: "10px" }}
                >
                  Explore Courts
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "80px",
              flexWrap: "wrap",
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ borderLeft: "2px solid rgba(14,187,170,0.5)", paddingLeft: "16px" }}>
                <p style={{ fontSize: "1.6rem", fontWeight: "900", color: "#fff", lineHeight: "1" }}>{s.value}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

      </section>


      {/* ── GALLERY (Infinite Scroll) ── */}
      <section style={{ padding: "100px 0 80px", overflow: "hidden" }}>
        <AnimatedSection style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", marginBottom: "40px" }}>
          <span className="section-label">Gallery</span>
          <h2 className="section-title" style={{ marginTop: "12px" }}>
            Experience the <span style={{ color: "var(--color-accent)" }}>Arena</span>
          </h2>
        </AnimatedSection>

        <div style={{ position: "relative", overflow: "hidden" }}>
          {/* Left fade */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, var(--color-bg), transparent)", zIndex: 2 }} />
          {/* Right fade */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, var(--color-bg), transparent)", zIndex: 2 }} />

          <div className="gallery-track">
            {[...galleryImages, ...galleryImages].map((img, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: "380px",
                  height: "260px",
                  flexShrink: 0,
                  marginRight: "16px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                className="gallery-item"
              >
                <Image
                  src={img}
                  alt={`Gallery ${(i % galleryImages.length) + 1}`}
                  fill
                  style={{ objectFit: "cover", transition: "transform 0.5s ease, filter 0.5s ease", filter: "brightness(0.85)" }}
                  className="gallery-img"
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .gallery-item:hover .gallery-img { transform: scale(1.08); filter: brightness(1.05); }
        `}</style>
      </section>

      {/* ── COURTS PREVIEW ── */}
      <section style={{ padding: "80px 0", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedSection style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="section-label">Our Courts</span>
            <h2 className="section-title" style={{ marginTop: "12px" }}>
              Premium <span style={{ color: "var(--color-accent)" }}>Playing Courts</span>
            </h2>
            <p style={{ color: "var(--color-text-secondary)", marginTop: "16px", maxWidth: "480px", margin: "16px auto 0", lineHeight: "1.7", fontSize: "0.95rem" }}>
              Championship-grade courts with professional facilities for every level of play.
            </p>
          </AnimatedSection>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {loading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>Loading courts...</div>
            ) : (
              courts.map((court, i) => (
                <CourtCard 
                  key={court.id} 
                  id={court.id}
                  name={court.name}
                  image={court.image_url || "/images/lapangan1.jpg"}
                  pricePerHour={court.price_per_hour}
                  description={court.description}
                  status={court.status}
                  index={i} 
                />
              ))
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/courts">
              <button className="btn-outline" style={{ padding: "14px 40px", fontSize: "0.95rem", borderRadius: "10px" }}>
                View All Courts
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── RACKET RENTAL ── */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "center",
            }}
            className="rental-grid"
          >
            <AnimatedSection direction="left">
              <span className="section-label">Racket Rental</span>
              <h2 className="section-title" style={{ marginTop: "12px" }}>
                Top-Tier <span style={{ color: "var(--color-accent)" }}>Rackets</span><br />for Every Game
              </h2>
              <p style={{ color: "var(--color-text-secondary)", marginTop: "16px", lineHeight: "1.8", fontSize: "0.95rem" }}>
                Don&apos;t have a racket? No problem. Rent our professional-grade padel rackets at affordable hourly rates.
                Available at the counter during your booking.
              </p>
              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>), text: "Pro-grade carbon frame" },
                  { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>), text: "Available on demand" },
                  { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>), text: "All grip sizes" },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--color-accent)", display: "flex" }}>{f.icon}</span>
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/booking">
                <button className="btn-neon" style={{ marginTop: "32px" }}>Rent a Racket</button>
              </Link>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {loading ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>Loading rackets...</div>
                ) : (
                  rackets.map((r) => (
                    <motion.div
                      key={r.id}
                      whileHover={{ y: -6, scale: 1.02 }}
                      style={{
                        background: "var(--color-bg-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        opacity: r.available ? 1 : 0.6
                      }}
                    >
                      <div style={{ position: "relative", height: "200px" }}>
                        <Image src={r.image_url || "/images/raket2.jpg"} alt={r.name} fill style={{ objectFit: "cover" }} />
                        {!r.available && (
                           <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "0.8rem" }}>OUT OF STOCK</div>
                        )}
                      </div>
                      <div style={{ padding: "14px" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text)", marginBottom: "4px" }}>{r.name}</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: "700" }}>
                          Rp {r.price_per_hour.toLocaleString("id-ID")}/hr
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SHOP PREVIEW ── */}
      <section style={{ padding: "80px 0", background: "var(--color-bg)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedSection style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <span className="section-label">Club Shop</span>
              <h2 className="section-title" style={{ marginTop: "12px" }}>
                Gear Up in <span style={{ color: "var(--color-accent)" }}>Style</span>
              </h2>
            </div>
            <Link href="/shop">
              <button className="btn-outline">View All Products</button>
            </Link>
          </AnimatedSection>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {loading ? (
               <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>Loading products...</div>
            ) : (
              products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  image={p.image_url || "/images/bajupadelcewek.jpg"}
                  price={p.price}
                  category={p.category}
                  index={i}
                  onAddToCart={addToCart}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section style={{ padding: "100px 24px", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-label">Location</span>
              <h2 className="section-title" style={{ marginTop: "16px" }}>
                Our <span style={{ color: "var(--color-accent)" }}>Arena</span>
              </h2>
            </div>
            
            <div
              className="location-card"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "32px",
                padding: "40px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr",
                gap: "40px",
                alignItems: "stretch",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: "20px" }}>
                <span className="section-label" style={{ marginBottom: "12px" }}>Find Us</span>
                <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginBottom: "28px" }}>
                  Main Padel Bali <span style={{ color: "var(--color-accent)" }}>Arena</span>
                </h3>
                
                <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text)", fontWeight: "700", fontSize: "1.05rem", marginBottom: "4px" }}>
                      Rektorat Universitas Udayana
                    </p>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                      Jl. Kampus Udayana, Jimbaran, Kec. Kuta Sel.,<br />
                      Kabupaten Badung, Bali 80361
                    </p>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Phone & Booking</p>
                    <p style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-text)" }}>0813 3971 1438</p>
                  </div>
                </div>

                <a 
                  href="https://wa.me/6281339711438" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-neon"
                    style={{ width: "100%", padding: "16px", fontSize: "0.95rem", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 20px rgba(14,187,170,0.2)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.119.554 4.188 1.604 6.04L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.632 0 12.028-5.391 12.03-12.027a11.8 11.8 0 00-3.486-8.484"/></svg>
                    Contact via WhatsApp
                  </motion.button>
                </a>
              </div>
              
              <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--color-border)", minHeight: "450px" }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15771.655824408967!2d115.1796272!3d-8.7941543!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd244bc39fb3da7%3A0x6cae8cb2a990cae5!2sRektorat%20Universitas%20Udayana!5e0!3m2!1id!2sid!4v1773216463589!5m2!1sid!2sid"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, position: "absolute", top: 0, left: 0 }} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "100px 24px" }}>
        <AnimatedSection>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              textAlign: "center",
              background: "linear-gradient(135deg, var(--color-accent-light) 0%, #f0f9ff 100%)",
              border: "1px solid rgba(2,132,199,0.15)",
              borderRadius: "32px",
              padding: "80px 48px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(2,132,199,0.07) 0%, transparent 70%)",
              }}
            />
            <span className="section-label">Ready?</span>
            <h2 className="section-title" style={{ marginTop: "16px", marginBottom: "20px" }}>
              Book Your Court <span style={{ color: "var(--color-accent)" }}>Today</span>
            </h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px", fontSize: "1rem", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto 40px" }}>
              Secure your preferred time slot now. Courts fill up fast — especially on weekends!
            </p>
            <Link href="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon"
                style={{ padding: "18px 48px", fontSize: "1rem", borderRadius: "12px" }}
              >
                Book a Court Now
              </motion.button>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Cart badge */}
      {cart.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 50,
            background: "var(--color-accent)",
            color: "#fff",
            borderRadius: "999px",
            padding: "12px 20px",
            fontWeight: "700",
            fontSize: "0.875rem",
            boxShadow: "0 8px 24px rgba(14,187,170,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {cart.length} item{cart.length > 1 ? "s" : ""} in cart
        </motion.div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .rental-grid { grid-template-columns: 1fr !important; }
          .location-card { grid-template-columns: 1fr !important; gap: 40px !important; padding: 24px !important; }
          .location-card div:first-child { text-align: center !important; padding-right: 0 !important; }
          .location-card .section-title { text-align: center !important; }
          .location-card div:first-child div { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
