import Link from "next/link";
import { Truck, Zap, Users, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Truck className="h-5 w-5 text-primary" />
            QuoteHaul
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Log in</Link>
            <Button asChild size="sm">
              <Link href="/signup">Start free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="mb-4">For removal companies</Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Turn website visitors into booked removals
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A branded, multi-step quote funnel: visitors get an instant estimate in under 60 seconds,
          every enquiry lands in your dashboard, and your team confirms the exact price before
          anything is booked.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              Start free — no card required <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#pricing">See pricing</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Instant, accurate estimates", body: "Visitors get a price range in about 60 seconds, worked out from real distance, property size, and your own rate card." },
            { icon: Users, title: "Every lead captured", body: "Full job details land in your dashboard, ready for your team to review and confirm — nothing falls through the cracks." },
            { icon: ShieldCheck, title: "Your brand, your prices", body: "Set your own rates and branding. Leads are yours to keep, never shared with competitors." },
          ].map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Simple pricing</h2>
            <p className="mt-2 text-muted-foreground">Start free. Upgrade when leads start coming in.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <p className="text-3xl font-bold">£0</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Quote funnel + lead capture", "Up to 20 leads/month", "Email notifications", "“Powered by QuoteHaul” badge"].map((i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-6 w-full">
                  <Link href="/signup?plan=free">Start free</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Paid</CardTitle>
                  <Badge>Most popular</Badge>
                </div>
                <p className="text-3xl font-bold">£97<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Unlimited leads", "Email + SMS notifications", "Human-confirmation dashboard workflow", "Saved-quote retrieval", "FAQ + checklist content pages", "Custom branding, badge removed", "Staff accounts + analytics"].map((i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/signup?plan=paid">Start 14-day trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        QuoteHaul — instant quote & lead systems for removal companies.
      </footer>
    </main>
  );
}
