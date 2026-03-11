import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Main Padel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout intentionally does NOT include the global Navbar and Footer,
  // giving the admin panel its own clean, self-contained layout shell.
  return <>{children}</>;
}
