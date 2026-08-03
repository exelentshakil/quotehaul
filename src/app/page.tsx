import Link from "next/link";
import { Truck, Zap, Users, ShieldCheck, ArrowRight, Check, MessageSquare, KanbanSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Zap, title: "Instant, accurate estimates", body: "Visitors get a price range in about 60 seconds, worked out from real distance, property size, and your own rate card." },
  { icon: MessageSquare, title: "Every order, tracked properly", body: "Each lead becomes an order with its own thread — customers message you and get replies straight to their inbox, no portal login needed." },
  { icon: KanbanSquare, title: "A board that stops leads dying", body: "Every enquiry lands on a Kanban board your team actually uses, so nothing sits unread in an inbox." },
  { icon: Sparkles, title: "AI that chases stalled leads", body: "Quiet leads get an AI-drafted follow-up your team can send in one click — jobs won from leads you already paid to capture." },
  { icon: ShieldCheck, title: "Your brand, your prices", body: "Set your own rates and branding on your own domain. Leads are yours to keep, never shared with competitors." },
  { icon: Users, title: "A real person confirms every quote", body: "The instant estimate is a guide — your team reviews and confirms the exact price before anything is booked." },
];

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
              <Link href="/signup">Start 14-day trial</Link>
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
          every enquiry lands on your Kanban board, and your team confirms the exact price before
          anything is booked.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              Start your 14-day trial <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#pricing">See pricing</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Full access for 14 days. Card required to start — cancel anytime before you're charged.</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="shadow-card">
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
            <p className="mt-2 text-muted-foreground">Try everything free for 14 days. Downgrade to a limited free plan any time you like, no card kept on file if you cancel.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <p className="text-sm text-muted-foreground">After your trial, if you don't upgrade</p>
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
                <p className="text-sm text-muted-foreground">14-day free trial, then</p>
                <p className="text-3xl font-bold">£97<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Unlimited leads", "Email + SMS notifications", "AI lead scoring + follow-up drafts", "Threaded order messaging, reply by email", "Custom domain, no QuoteHaul branding", "Human-confirmation dashboard workflow"].map((i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/signup">Start 14-day trial</Link>
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
