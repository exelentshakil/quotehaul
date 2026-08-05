import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvoiceEmail } from "@/lib/notifications";
import type { Quote, Tenant } from "@/types/database";

// Creates a branded invoice record, then posts a link to it into the same
// order thread staff already use for messaging — the customer gets it by
// email exactly like any other order update, no separate notification path.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const label = (body?.label as string) || "Deposit";
  const instructions = (body?.instructions as string) || null;
  if (!amount || amount <= 0) return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const admin = createAdminClient();
  const { data: invoice, error } = await admin
    .from("invoices")
    .insert({ tenant_id: quote.tenant_id, quote_id: id, amount, label, instructions })
    .select()
    .single();
  if (error || !invoice) return NextResponse.json({ error: error?.message ?? "Could not create the invoice" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const invoiceUrl = `${siteUrl}/invoice/${invoice.id}`;
  const messageBody = `Invoice — ${label}: £${amount.toFixed(2)}\n\nView and pay: ${invoiceUrl}`;

  await supabase.from("order_messages").insert({
    quote_id: id,
    tenant_id: quote.tenant_id,
    author_type: "staff",
    author_name: tenant.company_name,
    body: messageBody,
  });

  await sendInvoiceEmail(tenant, quote, invoiceUrl, amount, label);

  return NextResponse.json({ ok: true, invoiceUrl });
}
