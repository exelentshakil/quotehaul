import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { notifyNewMessage } from "@/lib/notifications";
import type { Quote, StripeAccount, Tenant } from "@/types/database";

// Staff-triggered only — never part of the customer-facing funnel (§4.5).
// Creates a Stripe Payment Link as a destination charge straight to the
// tenant's own connected account; funds never sit on the platform.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();
  const { data: account } = await supabase.from("stripe_accounts").select("*").eq("tenant_id", quote.tenant_id).maybeSingle<StripeAccount>();
  if (!tenant || !account || account.status !== "verified") {
    return NextResponse.json({ error: "Connect your Stripe account in Settings before requesting payment" }, { status: 400 });
  }

  const stripe = getStripe();
  const label = body.label?.trim() || `Payment for ${quote.from_postcode} → ${quote.to_postcode}`;

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price_data: { currency: "gbp", unit_amount: Math.round(amount * 100), product_data: { name: label } }, quantity: 1 }],
    transfer_data: { destination: account.stripe_account_id },
    after_completion: { type: "redirect", redirect: { url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${tenant.slug}/retrieve?token=${quote.token}` } },
  });

  await supabase.from("order_payments").insert({
    tenant_id: quote.tenant_id,
    quote_id: id,
    amount,
    status: "pending",
    stripe_payment_link_id: paymentLink.id,
    url: paymentLink.url,
  });

  const messageBody = `${label}: please pay £${amount.toFixed(2)} securely here: ${paymentLink.url}`;
  await supabase.from("order_messages").insert({ quote_id: id, tenant_id: quote.tenant_id, author_type: "staff", author_name: tenant.company_name, body: messageBody });
  await notifyNewMessage(tenant, quote, "staff", messageBody, quote.customer_email);

  return NextResponse.json({ ok: true, url: paymentLink.url });
}
