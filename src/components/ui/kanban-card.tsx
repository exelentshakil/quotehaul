import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Quote } from "@/types/database";

export function KanbanCard({ quote, dragging }: { quote: Quote; dragging?: boolean }) {
  const ageHours = Math.round((Date.now() - new Date(quote.updated_at).getTime()) / (1000 * 60 * 60));
  const isStale = ageHours >= 24 && !["booked", "lost"].includes(quote.status);

  return (
    <Link
      href={`/dashboard/leads/${quote.id}`}
      className={cn(
        "block rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-popover",
        dragging && "opacity-50"
      )}
    >
      <p className="text-sm font-medium">{quote.customer_name || "(no details yet)"}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{quote.from_postcode} → {quote.to_postcode}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium">
          {quote.confirmed_price ? `£${quote.confirmed_price}` : `£${quote.estimate_low}–£${quote.estimate_high}`}
        </span>
        {isStale && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
            idle {ageHours}h
          </span>
        )}
      </div>
    </Link>
  );
}
