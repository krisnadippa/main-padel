"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courts", href: "/courts" },
  { label: "Booking", href: "/booking" },
  { label: "Shop", href: "/shop" },
  { label: "Gallery", href: "/gallery" },
  { label: "Cek Booking", href: "/check-booking" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid rgba(226,232,240,0.6)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "66px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.02 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", fontWeight: "900", color: "#fff", flexShrink: 0,
                boxShadow: "0 3px 10px rgba(2,132,199,0.3)",
              }}>M</div>
              <div>
                <span style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Main<span style={{ color: "#0284c7" }}>Padel</span>
                </span>
                <p style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: "1", marginTop: "1px" }}>Bali</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2px" }} className="desktop-nav">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    style={{
                      padding: "8px 14px", borderRadius: "8px",
                      fontSize: "0.875rem", fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#0284c7" : "#475569",
                      background: isActive ? "#e0f2fe" : "transparent",
                      transition: "all 0.15s ease",
                      position: "relative",
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div layoutId="nav-indicator" style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#0284c7" }} />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="desktop-nav">
            <Link href="/booking" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  color: "#fff", fontWeight: "700", padding: "9px 20px", borderRadius: "9px",
                  border: "none", cursor: "pointer", fontSize: "0.85rem",
                  boxShadow: "0 3px 12px rgba(2,132,199,0.25)",
                  transition: "box-shadow 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                Book Now
              </motion.button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
            style={{ display: "none", background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", flexDirection: "column", gap: "4px", alignItems: "center" }} aria-label="Menu">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: "18px", height: "2px", background: "#475569", borderRadius: "2px", transition: "all 0.25s ease",
                opacity: i === 1 && mobileOpen ? 0 : 1,
                transform: i === 0 && mobileOpen ? "rotate(45deg) translateY(6px)" : i === 2 && mobileOpen ? "rotate(-45deg) translateY(-6px)" : "none",
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ position: "fixed", top: "66px", left: 0, right: 0, zIndex: 99, background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 14px 16px", display: "flex", flexDirection: "column", gap: "3px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ padding: "11px 12px", color: pathname === link.href ? "#0284c7" : "#475569", textDecoration: "none", fontSize: "0.95rem", fontWeight: pathname === link.href ? "700" : "500", borderRadius: "8px", background: pathname === link.href ? "#e0f2fe" : "transparent" }}>
                {link.label}
              </Link>
            ))}
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <Link href="/booking" style={{ flex: 1 }}>
                <button className="btn-neon" style={{ width: "100%", justifyContent: "center", padding: "11px" }}>Book Now</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
