import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
// Curated tenant page-builder font choices (Puck root field) — loaded once
// here so every tenant page already has all four CSS variables available;
// which one actually applies is just a `font-family: var(--font-x)` pick.
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-rounded" });

export const metadata: Metadata = {
  title: "QuoteHaul — instant quote & lead system for removal companies",
  description: "White-label instant-quote funnel and lead dashboard for removal companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${lora.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
