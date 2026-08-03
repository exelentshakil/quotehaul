import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewMessage } from "@/lib/notifications";
import type { Quote, Tenant } from "@/types/database";

// The customer side of the order thread — no login, just the magic-link token
// (same token as saved-quote retrieval). Verified server-side before writing.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.body?.trim()) return NextResponse.json({ error: "Message is empty" }, { status: 400 });

  const admin = createAdminClient();
  const { data: quote } = await admin.from("quotes").select("*").eq("token", token).single<Quote>();
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const { data: tenant } = await admin.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { error } = await admin.from("order_messages").insert({
    quote_id: quote.id,
    tenant_id: quote.tenant_id,
    author_type: "customer",
    author_name: quote.customer_name ?? "Customer",
    body: body.body,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: ownerRow } = await admin
    .from("tenant_users")
    .select("user_id")
    .eq("tenant_id", tenant.id)
    .eq("role", "owner")
    .maybeSingle();
  let ownerEmail: string | null = null;
  if (ownerRow?.user_id) {
    const { data: ownerUser } = await admin.auth.admin.getUserById(ownerRow.user_id);
    ownerEmail = ownerUser.user?.email ?? null;
  }

  await notifyNewMessage(tenant, quote, "customer", body.body, ownerEmail);

  return NextResponse.json({ ok: true });
}
