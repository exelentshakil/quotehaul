import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Keeps tenants.plan_id in sync with the tenant's real Stripe subscription
// status. This is the source of truth for Free vs Paid — not anything set
// manually at signup.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  async function setTenantPlan(tenantId: string, planSlug: "free" | "paid", updates: Record<string, unknown> = {}) {
    const { data: plan } = await admin.from("plans").select("id").eq("slug", planSlug).single();
    if (!plan) return;
    await admin.from("tenants").update({ plan_id: plan.id, ...updates }).eq("id", tenantId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id || session.client_reference_id;
      if (tenantId && session.customer) {
        await setTenantPlan(tenantId, "paid", {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata?.tenant_id;
      if (tenantId) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await setTenantPlan(tenantId, isActive ? "paid" : "free", {
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata?.tenant_id;
      if (tenantId) {
        await setTenantPlan(tenantId, "free", { subscription_status: "canceled" });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
