import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan, RateConfig, Tenant } from "@/types/database";
import SettingsForm from "./SettingsForm";
import BillingCard from "./BillingCard";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return <p>No company found for your account.</p>;

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  const { data: rateConfig } = await supabase.from("rate_configs").select("*").eq("tenant_id", membership.tenant_id).single<RateConfig>();
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
      <SettingsForm tenant={tenant} rateConfig={rateConfig} />
    </div>
  );
}
