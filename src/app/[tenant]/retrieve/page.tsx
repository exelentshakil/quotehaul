import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderMessage, Plan, Quote, Tenant } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProjectDataPanel } from "@/components/ui/project-data-panel";
import { OrderMessageThread } from "@/components/order-message-thread";
import { TenantNav } from "@/components/tenant-nav";
import { TenantFooter } from "@/components/tenant-footer";

async function getOrder(tenant: Tenant, plan: Plan | null, token: string | undefined) {
  if (!token) return { quote: null, disabled: false, messages: [] as OrderMessage[] };
  const admin = createAdminClient();
  if (!plan?.features.saved_quote_retrieval) return { quote: null, disabled: true, messages: [] as OrderMessage[] };
  const { data: quote } = await admin.from("quotes").select("*").eq("token", token).eq("tenant_id", tenant.id).maybeSingle<Quote>();
  const { data: messages } = quote
    ? await admin.from("order_messages").select("*").eq("quote_id", quote.id).order("created_at", { ascending: true }).returns<OrderMessage[]>()
    : { data: [] };
  return { quote, disabled: false, messages: messages ?? [] };
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
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return notFound();
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  const { data: pages } = await admin.from("page_layouts").select("slug, nav_label, name").eq("tenant_id", tenant.id).eq("is_published", true).not("slug", "is", null);
  const result = await getOrder(tenant, plan, token);

  return (
    <main className="flex min-h-screen flex-col">
      <TenantNav tenantSlug={slug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages ?? []} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
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

        {result.disabled && <p className="text-muted-foreground">Order tracking isn&apos;t available for this company yet.</p>}

        {result.quote && (
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
              placeholder={`Message ${tenant.company_name}...`}
            />
          </div>
        )}

        {token && !result.quote && !result.disabled && <p className="text-muted-foreground">No order found for that link.</p>}
      </div>
      <TenantFooter companyName={tenant.company_name} />
    </main>
  );
}
