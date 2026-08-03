import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Quote, Tenant } from "@/types/database";

async function getQuoteByToken(tenantSlug: string, token: string | undefined) {
  if (!token) return null;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", tenantSlug).single<Tenant>();
  if (!tenant) return null;
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  if (!plan?.features.saved_quote_retrieval) return { tenant, plan, quote: null, disabled: true };
  const { data: quote } = await admin.from("quotes").select("*").eq("token", token).eq("tenant_id", tenant.id).maybeSingle<Quote>();
  return { tenant, plan, quote, disabled: false };
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
  const result = await getQuoteByToken(slug, token);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">Retrieve a saved quote</h1>

      {!token && (
        <form className="space-y-4" action={`/${slug}/retrieve`}>
          <label className="mb-1 block text-sm font-medium">Paste your quote link token</label>
          <input name="token" className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="e.g. from your confirmation email" />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Find my quote</button>
        </form>
      )}

      {result?.disabled && <p className="text-slate-600">Saved-quote retrieval isn&apos;t available for this company yet.</p>}

      {result?.quote && (
        <div className="rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">{result.quote.from_postcode} → {result.quote.to_postcode}</p>
          <p className="mt-2 text-2xl font-bold">
            {result.quote.confirmed_price
              ? `£${result.quote.confirmed_price} (confirmed)`
              : `£${result.quote.estimate_low}–£${result.quote.estimate_high} (guide only)`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Status: {result.quote.status.replace("_", " ")}</p>
        </div>
      )}

      {token && !result?.quote && !result?.disabled && <p className="text-slate-600">No quote found for that link.</p>}
    </main>
  );
}
