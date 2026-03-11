"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === "Invalid login credentials" 
          ? "Email atau password yang Anda masukkan salah." 
          : error.message);
        return;
      }

      if (data.user) {
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8fafc", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "24px" 
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ 
          width: "100%", 
          maxWidth: "1000px", 
          background: "#fff", 
          borderRadius: "24px", 
          overflow: "hidden", 
          display: "flex",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          minHeight: "600px"
        }}
      >
        {/* Left: Image Section (Hidden on mobile) */}
        <div style={{ 
          flex: "1.1", 
          position: "relative",
          display: "none"
        }} className="login-image-section">
          <Image 
            src="/images/loginimages.jpg" 
            alt="Login Padel" 
            fill 
            style={{ objectFit: "cover" }} 
            priority
          />
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px",
            color: "#fff"
          }}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "900", color: "#fff", boxShadow: "0 3px 10px rgba(2,132,199,0.3)" }}>M</div>
                <div>
                  <span style={{ fontSize: "1rem", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em" }}>
                    Main<span style={{ color: "#0284c7" }}>Padel</span>
                  </span>
                  <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.6)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: "1", marginTop: "1px" }}>Bali</p>
                </div>
             </div>
             <h2 style={{ fontSize: "2rem", fontWeight: "800", lineHeight: "1.2" }}>Elevate Your Game at <br/><span style={{ color: "var(--color-accent)" }}>Bali's Premier Court</span></h2>
          </div>
        </div>

        {/* Right: Form Section */}
        <div style={{ 
          flex: "1", 
          padding: "60px 48px", 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ marginBottom: "40px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "24px" }} className="mobile-logo">
               <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "900", color: "#fff", boxShadow: "0 3px 10px rgba(2,132,199,0.3)" }}>M</div>
                  <div>
                    <span style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                      Main<span style={{ color: "#0284c7" }}>Padel</span>
                    </span>
                    <p style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: "1", marginTop: "1px" }}>Bali</p>
                  </div>
               </div>
            </Link>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Welcome Back</h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Login to your administrative account</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ 
                  background: "#fee2e2", 
                  border: "1px solid #fecaca", 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  marginBottom: "24px", 
                  color: "#dc2626", 
                  fontSize: "0.85rem", 
                  fontWeight: "600"
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mainpadel.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "2px solid #f1f5f9",
                  background: "#f8fafc",
                  fontSize: "1rem",
                  color: "#0f172a",
                  transition: "all 0.2s"
                }}
                className="login-input"
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
                <a href="#" style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: "700", textDecoration: "none" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "2px solid #f1f5f9",
                    background: "#f8fafc",
                    fontSize: "1rem",
                    color: "#0f172a",
                    transition: "all 0.2s"
                  }}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ 
                    position: "absolute", 
                    right: "16px", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-neon"
              style={{ width: "100%", height: "54px", fontSize: "1rem", fontWeight: "700", borderRadius: "12px", opacity: isLoading ? 0.8 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8", fontSize: "0.85rem" }}>
            Don&apos;t have an account? <a href="#" style={{ color: "var(--color-accent)", fontWeight: "700", textDecoration: "none" }}>Contact Support</a>
          </p>
        </div>
      </motion.div>

      <style jsx>{`
        .login-input:focus {
          border-color: var(--color-accent) !important;
          background: #fff !important;
          outline: none;
          box-shadow: 0 0 0 4px rgba(14, 187, 170, 0.1);
        }
        @media (min-width: 768px) {
          .login-image-section { display: block !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
