import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { Plan, RateConfig, StripeAccount, Tenant } from "@/types/database";
import SettingsForm from "./SettingsForm";
import BillingCard from "./BillingCard";
import PaymentsCard from "./PaymentsCard";
import ContentGenCard from "./ContentGenCard";
import DomainsCard from "./DomainsCard";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;

  const supabase = await createClient();
  const [{ data: tenant }, { data: rateConfig }, { data: stripeAccount }, { data: adCopyPage }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>(),
    supabase.from("rate_configs").select("*").eq("tenant_id", membership.tenant_id).single<RateConfig>(),
    supabase.from("stripe_accounts").select("*").eq("tenant_id", membership.tenant_id).maybeSingle<StripeAccount>(),
    supabase.from("content_pages").select("content").eq("tenant_id", membership.tenant_id).eq("type", "ad_copy").maybeSingle(),
  ]);
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();

  if (!tenant || !rateConfig) return <p>Setup incomplete.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
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
      {plan?.slug === "paid" && <PaymentsCard status={stripeAccount?.status ?? null} />}
      {plan?.slug === "paid" && <ContentGenCard existingAdCopy={adCopyPage?.content ?? null} />}
      {plan?.slug === "paid" && (
        <Link href="/page-builder" className="block rounded-xl border border-border bg-card p-4 text-sm font-medium shadow-card hover:bg-accent">
          Open the visual page builder →
        </Link>
      )}
      <SettingsForm tenant={tenant} rateConfig={rateConfig} />
    </div>
  );
}
