import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

// Sends a paid tenant to the Stripe-hosted billing portal to manage/cancel
// their subscription (self-serve, no custom UI needed).
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const { data: tenant } = await supabase.from("tenants").select("stripe_customer_id").eq("id", membership.tenant_id).single();
  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet — upgrade first" }, { status: 400 });
  }

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${siteUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
