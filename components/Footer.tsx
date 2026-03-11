import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#fff",
        borderTop: "1px solid var(--color-border)",
        padding: "56px 24px 28px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: "900",
                  color: "#fff",
                  boxShadow: "0 3px 10px rgba(2,132,199,0.2)",
                  flexShrink: 0,
                }}
              >
                M
              </div>
              <div>
                <span style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Main<span style={{ color: "#0284c7" }}>Padel</span>
                </span>
                <p style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: "1", marginTop: "1px" }}>Bali</p>
              </div>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: "1.7" }}>
              Premium padel courts in the heart of the city. Book, play, and excel with the best facilities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.72rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "16px",
              }}
            >
              Quick Links
            </h4>
            {[
              { label: "Home", href: "/" },
              { label: "Courts", href: "/courts" },
              { label: "Book a Court", href: "/booking" },
              { label: "Shop", href: "/shop" },
              { label: "Gallery", href: "/gallery" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  marginBottom: "10px",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.72rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "16px",
              }}
            >
              Contact
            </h4>
            {[
              { text: "Jl. Padel Raya No. 1, Bali" },
              { text: "+62 813 3971 1438" },
              { text: "info@mainpadel.com" },
              { text: "Open daily 07:00 – 23:00" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  marginBottom: "10px",
                  lineHeight: "1.5",
                }}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* Social */}
          <div>
            <h4
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.72rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "16px",
              }}
            >
              Follow Us
            </h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {[{ label: "IG", title: "Instagram" }, { label: "TK", title: "TikTok" }, { label: "WA", title: "WhatsApp" }].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  title={s.title}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "9px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    color: "var(--color-accent)",
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: "24px" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
            © 2026 Main Padel. All rights reserved.
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
            Built with <span style={{ color: "var(--color-accent)" }}>♥</span> for padel lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
