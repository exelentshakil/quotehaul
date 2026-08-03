import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StripeAccount } from "@/types/database";

// Stripe redirects here after onboarding (or a refresh); re-checks the
// account's real status directly from Stripe rather than trusting the
// redirect alone, then sends the owner back to Settings.
export async function GET(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const tenantId = new URL(req.url).searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.redirect(`${siteUrl}/dashboard/settings`);

  const admin = createAdminClient();
  const { data: account } = await admin.from("stripe_accounts").select("*").eq("tenant_id", tenantId).maybeSingle<StripeAccount>();
  if (account) {
    const stripe = getStripe();
    const stripeAccount = await stripe.accounts.retrieve(account.stripe_account_id);
    const status = stripeAccount.charges_enabled ? "verified" : "pending";
    await admin.from("stripe_accounts").update({ status, updated_at: new Date().toISOString() }).eq("tenant_id", tenantId);
  }

  return NextResponse.redirect(`${siteUrl}/dashboard/settings?connect=1`);
}
