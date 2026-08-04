import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LeadScore, OrderMessage, Plan, Quote } from "@/types/database";
import { ProjectDataPanel } from "@/components/ui/project-data-panel";
import { OrderMessageThread } from "@/components/order-message-thread";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadScorePanel } from "@/components/lead-score-panel";
import { SendInvoicePanel } from "@/components/send-invoice-panel";
import ConfirmForm from "./ConfirmForm";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return notFound();

  // Independent queries fired together — each round trip run serially was
  // adding several hundred ms of pure network latency to this page.
  const [{ data: messages }, { data: leadScore }, { data: tenant }] = await Promise.all([
    supabase.from("order_messages").select("*").eq("quote_id", id).order("created_at", { ascending: true }).returns<OrderMessage[]>(),
    supabase.from("lead_scores").select("*").eq("quote_id", id).maybeSingle<LeadScore>(),
    supabase.from("tenants").select("plan_id").eq("id", quote.tenant_id).single(),
  ]);
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();
  const canSendInvoice = plan?.slug === "paid";

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
        {canSendInvoice && <SendInvoicePanel quoteId={id} defaultAmount={quote.confirmed_price ?? quote.estimate_high ?? 0} />}
      </div>

      <div className="space-y-6">
        <LeadScorePanel quoteId={id} initial={leadScore ?? null} />
        <OrderMessageThread messages={messages ?? []} endpoint={`/api/leads/${id}/message`} />
      </div>
    </div>
  );
}
