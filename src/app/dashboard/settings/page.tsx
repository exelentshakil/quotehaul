import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Plan, RateConfig, StripeAccount, Tenant } from "@/types/database";
import SettingsForm from "./SettingsForm";
import BillingCard from "./BillingCard";
import PaymentsCard from "./PaymentsCard";
import ContentGenCard from "./ContentGenCard";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return <p>No company found for your account.</p>;

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  const { data: rateConfig } = await supabase.from("rate_configs").select("*").eq("tenant_id", membership.tenant_id).single<RateConfig>();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();
  const { data: stripeAccount } = await supabase.from("stripe_accounts").select("*").eq("tenant_id", membership.tenant_id).maybeSingle<StripeAccount>();
  const { data: adCopyPage } = await supabase.from("content_pages").select("content").eq("tenant_id", membership.tenant_id).eq("type", "ad_copy").maybeSingle();

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
