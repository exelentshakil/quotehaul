import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PAID_PLAN_PRICE_ID } from "@/lib/stripe";

// Creates a Stripe Checkout Session so the signed-in tenant owner can upgrade
// Free -> Paid. Redirects back to /dashboard/settings either way; the webhook
// is what actually flips the tenant's plan once payment succeeds.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single();
  if (!tenant) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Every tenant gets exactly one 7-day trial, the first time they ever check
  // out. A tenant re-subscribing after lapsing back to Free (they already have
  // a stripe_subscription_id on record) pays immediately, no second trial.
  const isFirstCheckout = !tenant.stripe_subscription_id;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PAID_PLAN_PRICE_ID, quantity: 1 }],
    customer: tenant.stripe_customer_id || undefined,
    customer_email: tenant.stripe_customer_id ? undefined : user.email,
    client_reference_id: tenant.id,
    subscription_data: {
      metadata: { tenant_id: tenant.id },
      ...(isFirstCheckout ? { trial_period_days: 7 } : {}),
    },
    metadata: { tenant_id: tenant.id },
    success_url: `${siteUrl}/dashboard?trial_started=1`,
    cancel_url: `${siteUrl}/signup?checkout_cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
