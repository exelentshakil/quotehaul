import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LeadScore, OrderMessage, Quote } from "@/types/database";
import { ProjectDataPanel } from "@/components/ui/project-data-panel";
import { OrderMessageThread } from "@/components/order-message-thread";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadScorePanel } from "@/components/lead-score-panel";
import ConfirmForm from "./ConfirmForm";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return notFound();

  const { data: messages } = await supabase
    .from("order_messages")
    .select("*")
    .eq("quote_id", id)
    .order("created_at", { ascending: true })
    .returns<OrderMessage[]>();

  const { data: leadScore } = await supabase.from("lead_scores").select("*").eq("quote_id", id).maybeSingle<LeadScore>();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{quote.customer_name || "Unnamed lead"}</h1>
          <StatusBadge status={quote.status} />
        </div>

        <ProjectDataPanel
          fields={[
            { label: "Phone", value: quote.customer_phone },
            { label: "Email", value: quote.customer_email },
            { label: "From", value: `${quote.from_postcode} ${quote.from_town ?? ""}`.trim() },
            { label: "To", value: `${quote.to_postcode} ${quote.to_town ?? ""}`.trim() },
            { label: "Move date", value: quote.move_date ?? "Flexible" },
            { label: "Property size", value: quote.property_size },
            { label: "Distance", value: quote.distance_miles ? `${quote.distance_miles.toFixed(1)} mi${quote.is_sea_crossing ? " (sea crossing)" : ""}` : null },
            { label: "Source", value: quote.source },
          ]}
        />

        <ConfirmForm quote={quote} />
      </div>

      <div className="space-y-6">
        <LeadScorePanel quoteId={id} initial={leadScore ?? null} />
        <OrderMessageThread messages={messages ?? []} endpoint={`/api/leads/${id}/message`} />
      </div>
    </div>
  );
}
