import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderMessage, Plan, Quote, Tenant } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProjectDataPanel } from "@/components/ui/project-data-panel";
import { OrderMessageThread } from "@/components/order-message-thread";

async function getOrder(tenantSlug: string, token: string | undefined) {
  if (!token) return null;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", tenantSlug).single<Tenant>();
  if (!tenant) return null;
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  if (!plan?.features.saved_quote_retrieval) return { tenant, plan, quote: null, disabled: true, messages: [] };
  const { data: quote } = await admin.from("quotes").select("*").eq("token", token).eq("tenant_id", tenant.id).maybeSingle<Quote>();
  const { data: messages } = quote
    ? await admin.from("order_messages").select("*").eq("quote_id", quote.id).order("created_at", { ascending: true }).returns<OrderMessage[]>()
    : { data: [] };
  return { tenant, plan, quote, disabled: false, messages: messages ?? [] };
}

export default async function RetrievePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { tenant: slug } = await params;
  const { token } = await searchParams;
  const result = await getOrder(slug, token);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">Your order</h1>

      {!token && (
        <form className="space-y-4" action={`/${slug}/retrieve`}>
          <label className="mb-1 block text-sm font-medium">Paste your quote link token</label>
          <div className="flex gap-2">
            <Input name="token" placeholder="e.g. from your confirmation email" />
            <Button type="submit">Find my order</Button>
          </div>
        </form>
      )}

      {result?.disabled && <p className="text-muted-foreground">Order tracking isn&apos;t available for this company yet.</p>}

      {result?.quote && (
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{result.quote.from_postcode} → {result.quote.to_postcode}</p>
                <StatusBadge status={result.quote.status} />
              </div>
              <p className="text-2xl font-bold">
                {result.quote.confirmed_price
                  ? `£${result.quote.confirmed_price} (confirmed)`
                  : `£${result.quote.estimate_low}–£${result.quote.estimate_high} (guide only)`}
              </p>
            </CardContent>
          </Card>

          <ProjectDataPanel
            fields={[
              { label: "From", value: `${result.quote.from_postcode} ${result.quote.from_town ?? ""}`.trim() },
              { label: "To", value: `${result.quote.to_postcode} ${result.quote.to_town ?? ""}`.trim() },
              { label: "Move date", value: result.quote.move_date ?? "Flexible" },
              { label: "Property size", value: result.quote.property_size },
            ]}
          />

          <OrderMessageThread
            messages={result.messages}
            endpoint={`/api/public/quotes/${result.quote.token}/message`}
            placeholder={`Message ${result.tenant.company_name}...`}
          />
        </div>
      )}

      {token && !result?.quote && !result?.disabled && <p className="text-muted-foreground">No order found for that link.</p>}
    </main>
  );
}
