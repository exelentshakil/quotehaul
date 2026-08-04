import { StatusBadge } from "@/components/ui/status-badge";
import { MessageBubble } from "@/components/ui/message-bubble";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Send, Check, CreditCard } from "lucide-react";

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

export function QuoteFunnelPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-popover">
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
      <p className="text-sm font-semibold">What size is your property?</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {["Studio", "1 bed", "2 bed"].map((s, i) => (
          <div key={s} className={`rounded-md border px-3 py-2 text-center ${i === 2 ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-muted/60 p-3 text-center">
        <p className="text-xs text-muted-foreground">Your instant estimate</p>
        <p className="text-lg font-bold">£420–£510</p>
      </div>
    </div>
  );
}

export function PageBuilderPreview() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-popover">
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
  );
}

export function CapacityPreview() {
  const days = [
    { d: "Mon 4", status: "Open" }, { d: "Tue 5", status: "Near capacity" }, { d: "Wed 6", status: "Full" }, { d: "Thu 7", status: "Blocked" },
  ];
  const styles: Record<string, string> = { Open: "bg-success/10 text-success", "Near capacity": "bg-warning/10 text-warning", Full: "bg-danger/10 text-danger", Blocked: "bg-muted text-muted-foreground" };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-popover">
      <p className="mb-3 text-sm font-semibold">Next few days</p>
      <div className="space-y-2">
        {days.map((d) => (
          <div key={d.d} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
            <span className="font-medium">{d.d}</span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${styles[d.status]}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvoicingPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-popover">
      <p className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-primary" /> Request payment</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground">Deposit</div>
        <div className="w-16 rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground">£150</div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-xs text-success">
        <Check className="h-3.5 w-3.5" /> Paid straight into your own Stripe account
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
