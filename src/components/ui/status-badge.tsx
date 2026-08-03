import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/types/database";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  new: "bg-accent text-accent-foreground",
  pending_confirmation: "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
  sent: "bg-primary/10 text-primary",
  booked: "bg-success text-success-foreground",
  lost: "bg-muted text-muted-foreground",
};

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New",
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  sent: "Sent",
  booked: "Booked",
  lost: "Lost",
};

export function StatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
