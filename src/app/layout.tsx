import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteHaul — instant quote & lead system for removal companies",
  description: "White-label instant-quote funnel and lead dashboard for removal companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
