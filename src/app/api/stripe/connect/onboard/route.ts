import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { StripeAccount } from "@/types/database";

// Starts (or resumes) Stripe Express onboarding for the tenant's own connected
// account, used only to collect payment from their customers (§4.5) —
// separate from the tenant's own subscription in /api/stripe/checkout.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: existing } = await supabase.from("stripe_accounts").select("*").eq("tenant_id", membership.tenant_id).maybeSingle<StripeAccount>();

  let accountId = existing?.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({ type: "express" });
    accountId = account.id;
    await supabase.from("stripe_accounts").insert({ tenant_id: membership.tenant_id, stripe_account_id: accountId, status: "pending" });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/dashboard/settings`,
    return_url: `${siteUrl}/api/stripe/connect/return?tenant_id=${membership.tenant_id}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
