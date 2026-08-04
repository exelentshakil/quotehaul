import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Swap DEMO_VIDEO_URL in once the real recording exists — everything else
// (thumbnail, play button, layout) is already wired for it.
const DEMO_VIDEO_URL: string | null = null;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[40rem] bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]"
      />
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-28">
        <Badge variant="secondary" className="mb-5">By movers, for movers</Badge>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Turn website visitors into <span className="text-primary">booked removals</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A branded quote funnel, a Kanban board that stops leads dying, and AI that chases stalled ones —
          watch how it works below.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start your subscription <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#pricing">See pricing</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">£97/month, cancel any time.</p>

        <div className="relative mx-auto mt-14 max-w-3xl">
          {DEMO_VIDEO_URL ? (
            <video src={DEMO_VIDEO_URL} controls className="w-full rounded-2xl border border-border shadow-popover" />
          ) : (
            <button
              type="button"
              className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-accent to-primary/5 shadow-popover"
              aria-label="Watch the demo (coming soon)"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-popover transition-transform group-hover:scale-105">
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              </span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground">
                60-second demo — coming soon
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
