import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewMessage } from "@/lib/notifications";
import type { Quote, Tenant } from "@/types/database";

// Staff posts a message on an order thread; the customer gets emailed and can
// reply straight from their inbox (handled by the public message endpoint) or
// from their magic-link order page.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.body?.trim()) return NextResponse.json({ error: "Message is empty" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();

  const { error } = await supabase.from("order_messages").insert({
    quote_id: id,
    tenant_id: quote.tenant_id,
    author_type: "staff",
    author_name: tenant?.company_name ?? "Team",
    body: body.body,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (tenant) await notifyNewMessage(tenant, quote, "staff", body.body, quote.customer_email);

  return NextResponse.json({ ok: true });
}
