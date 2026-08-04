import Link from "next/link";
import { Sparkles, Send, ArrowRight, LayoutTemplate, Palette, Rows3 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// The flagship feature — deliberately given its own full-width hero card at
// the top of Settings instead of being one more line in a list of cards.
export function PageBuilderCard({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/40 to-transparent shadow-card">
      <div className="grid gap-6 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8">
        <div className="flex flex-col justify-center">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI page builder
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Build a conversion-ready landing page in minutes</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            A real visual editor with a curated block library — describe the page you want and AI assembles it from your own
            components, or drag it together yourself. Full-width sections, your own font and brand colors, built to convert
            Google and Facebook ad traffic.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <li className="flex items-center gap-1.5"><LayoutTemplate className="h-3.5 w-3.5 text-primary" /> Full-width sections</li>
            <li className="flex items-center gap-1.5"><Palette className="h-3.5 w-3.5 text-primary" /> Your brand, your font</li>
            <li className="flex items-center gap-1.5"><Rows3 className="h-3.5 w-3.5 text-primary" /> Header & footer included</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/page-builder">Open the page builder <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <a href={`/${tenantSlug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
              View your live page
            </a>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-popover sm:block">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold">AI page assistant</p>
          </div>
          <div className="space-y-2.5 p-4">
            <div className="flex gap-2">
              <Avatar name="You" className="h-6 w-6 text-[10px]" />
              <div className="rounded-xl bg-primary px-3 py-1.5 text-xs text-primary-foreground">focus on long-distance moves, warm tone</div>
            </div>
            <div className="flex gap-2">
              <Avatar name="AI" className="h-6 w-6 bg-primary text-[10px]" />
              <div className="rounded-xl bg-muted px-3 py-1.5 text-xs text-muted-foreground">Done — built from your live components.</div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <div className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground">Describe the page you want...</div>
            <Send className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
