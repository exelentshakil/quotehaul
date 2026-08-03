import Link from "next/link";
import { Check, Sparkles, MessageSquare, KanbanSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function ValueBar() {
  const items = ["Replaces your quote calculator", "Replaces your lead spreadsheet", "Replaces manual follow-up admin"];
  return (
    <div className="border-y border-border bg-muted/30 py-4">
      <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-2 px-6 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> {i}</li>
        ))}
      </ul>
    </div>
  );
}

export function FeatureShowcase({
  eyebrow,
  title,
  body,
  visual,
  reverse,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className={`mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:grid-cols-2 ${reverse ? "sm:[&>*:first-child]:order-2" : ""}`}>
      <div>
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-4 text-muted-foreground">{body}</p>
      </div>
      <div>{visual}</div>
    </div>
  );
}

const STEPS = [
  { icon: MessageSquare, title: "Get a quote", body: "The customer answers a few quick questions on your branded funnel." },
  { icon: KanbanSquare, title: "It lands on your board", body: "Every enquiry becomes a card — nothing sits unread in an inbox." },
  { icon: Sparkles, title: "AI keeps it moving", body: "Stalled leads get an AI-drafted follow-up your team sends in one click." },
];

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">{i + 1}</div>
            <s.icon className="mx-auto mt-4 h-5 w-5 text-primary" />
            <p className="mt-2 font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingSection() {
  return (
    <div id="pricing" className="border-t border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Simple pricing</h2>
          <p className="mt-2 text-muted-foreground">Try Pro free for 3 days. Downgrade to a limited free plan any time you like.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <p className="text-3xl font-bold">£0</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Quote funnel + Kanban board", "Up to 20 leads/month", "Email notifications", "“Powered by QuoteHaul” badge"].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary shadow-popover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro</CardTitle>
                <Badge>Most popular</Badge>
              </div>
              <p className="text-sm text-muted-foreground">3-day free trial, then</p>
              <p className="text-3xl font-bold">£97<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Unlimited leads", "Email + SMS notifications", "AI lead scoring + follow-up drafts", "Threaded order messaging, reply by email", "Custom domain, no QuoteHaul branding", "Capacity/calendar, invoicing, page builder"].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/signup">Start 3-day trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  { q: "Is the instant estimate a fixed price?", a: "No — it's a guide. A real person on your team reviews and confirms the exact price before anything's booked." },
  { q: "Can I cancel any time?", a: "Yes, from Settings → Billing, any time — including during the trial before you're ever charged." },
  { q: "Is my leads data shared with anyone else?", a: "No. Every account is fully isolated — your leads are yours, never shared with other companies." },
  { q: "How long does setup take?", a: "Most companies are live with their own branding and rates within an afternoon." },
];

export function FaqSection() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
      <div className="mt-8 divide-y divide-border">
        {FAQS.map((f) => (
          <div key={f.q} className="py-4">
            <p className="font-medium">{f.q}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinalCta() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-20">
      <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold">Ready to get moving?</h2>
        <p className="mt-2 text-primary-foreground/80">Start your free 3-day trial — no charge until it ends.</p>
        <Button asChild size="lg" variant="secondary" className="mt-6">
          <Link href="/signup">Start free trial</Link>
        </Button>
      </div>
    </div>
  );
}
