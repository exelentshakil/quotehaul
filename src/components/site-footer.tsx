import Link from "next/link";
import { Truck } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Quote funnel & wizard", href: "/#quote-funnel" },
      { label: "Kanban leads board", href: "/#kanban" },
      { label: "Order messaging", href: "/#order-messaging" },
      { label: "AI follow-up & scoring", href: "/#ai-followup" },
      { label: "AI page builder", href: "/#ai-page-builder" },
      { label: "Capacity & calendar", href: "/#capacity" },
      { label: "Invoicing", href: "/#invoicing" },
    ],
  },
  {
    title: "Why QuoteHaul",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "ROI for your business", href: "/#roi" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Start free trial", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 font-semibold">
            <Truck className="h-5 w-5 text-primary" /> QuoteHaul
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Instant quote & lead system for removal companies — built by movers, for movers.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-foreground hover:underline">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} QuoteHaul. Instant estimates are a guide only and confirmed by a real person before anything is booked.
      </div>
    </footer>
  );
}
