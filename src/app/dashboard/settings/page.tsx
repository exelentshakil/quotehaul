import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { Plan, RateConfig, Tenant } from "@/types/database";
import SettingsForm from "./SettingsForm";
import BillingCard from "./BillingCard";
import ContentGenCard from "./ContentGenCard";
import DomainsCard from "./DomainsCard";
import { PageBuilderCard } from "./PageBuilderCard";

// Stripe Connect (PaymentsCard.tsx, /api/stripe/connect/*) is deliberately
// not rendered here — enabling it means a second identity-verification pass
// on the owner's own Stripe account, and the real workflow for this industry
// is invoice-after-delivery once a job is actually confirmed and done, not
// upfront in-app payment collection. Code is kept, not deleted, in case that
// changes later.
export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;

  const supabase = await createClient();
  const [{ data: tenant }, { data: rateConfig }, { data: adCopyPage }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>(),
    supabase.from("rate_configs").select("*").eq("tenant_id", membership.tenant_id).single<RateConfig>(),
    supabase.from("content_pages").select("content").eq("tenant_id", membership.tenant_id).eq("type", "ad_copy").maybeSingle(),
  ]);
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();

  if (!tenant || !rateConfig) return <p>Setup incomplete.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      {plan?.slug === "paid" && <PageBuilderCard tenantSlug={tenant.slug} />}
      <BillingCard
        planSlug={plan?.slug ?? "free"}
        planName={plan?.name ?? "Free"}
        subscriptionStatus={tenant.subscription_status}
        trialEndsAt={tenant.trial_ends_at}
      />
      <DomainsCard
        slug={tenant.slug}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
        customDomain={tenant.custom_domain}
        customDomainStatus={tenant.custom_domain_status}
        isPro={plan?.slug === "paid"}
      />
      {plan?.slug === "paid" && <ContentGenCard existingAdCopy={adCopyPage?.content ?? null} />}
      <SettingsForm tenant={tenant} rateConfig={rateConfig} />
    </div>
  );
}
