import { StatusBadge } from "@/components/ui/status-badge";
import { MessageBubble } from "@/components/ui/message-bubble";
import { StatCard } from "@/components/ui/stat-card";
import { Sparkles } from "lucide-react";

// Non-interactive recreations of the real dashboard, built from the same
// shared atomic components (StatusBadge, MessageBubble, StatCard) and the
// same Tailwind tokens as the live product — not a design-tool mockup.

export function KanbanPreview() {
  const cards = [
    { name: "Sarah Whitfield", route: "SW1A 1AA → E1 6AN", price: "£420–£510", status: "new" as const },
    { name: "Marcus Doyle", route: "M1 1AE → L1 8JQ", price: "£780–£940", status: "pending_confirmation" as const },
    { name: "Priya Nair", route: "B1 1AA → LS1 4AP", price: "£680", status: "confirmed" as const },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-popover">
      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatCard label="Open leads" value="7" className="p-3" />
        <StatCard label="Booked" value="3" className="p-3" />
        <StatCard label="Pipeline" value="£4.6k" className="p-3" />
      </div>
      <div className="space-y-2">
        {cards.map((c) => (
          <div key={c.name} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{c.name}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.route}</p>
            <p className="mt-1.5 text-xs font-medium">{c.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessagingPreview() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-popover">
      <div className="divide-y divide-border px-4">
        <MessageBubble authorName="Sarah Whitfield" authorType="customer" body="Can you do the Tuesday of that week instead?" createdAt={new Date().toISOString()} />
        <MessageBubble authorName="Verify Removals Ltd" authorType="staff" body="Yes, Tuesday works — I've held that slot for you." createdAt={new Date().toISOString()} />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI drafted a follow-up for 3 quiet leads
        </div>
      </div>
    </div>
  );
}

export function ScorePreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-popover">
      <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> AI lead score</p>
      <p className="mt-2 text-4xl font-bold text-success">82<span className="text-base font-normal text-muted-foreground">/100</span></p>
      <div className="mt-3 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
        &ldquo;Hi Marcus, just checking in about your move — happy to lock in your date whenever works.&rdquo;
      </div>
    </div>
  );
}
