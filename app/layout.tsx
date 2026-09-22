import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "Ohuhu Marker Tracker",
    template: "%s",
  },
  description:
    "Track your Ohuhu marker collection and wishlist against the full Honolulu, Oahu and Kaala color catalog. Sign in to keep your collection private.",
};

export const viewport: Viewport = {
  themeColor: "#6d5ae6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main className="app">{children}</main>
          <footer className="footer">
            Catalog data follows Ohuhu&apos;s 2025 unified color codes. Hex values are approximate.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}