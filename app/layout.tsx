import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Main Padel — Premium Courts",
  description: "Book premium padel courts, rent rackets, and shop exclusive gear at Main Padel Club.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter, sans-serif)", overflowX: "hidden", width: "100%", position: "relative" }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
