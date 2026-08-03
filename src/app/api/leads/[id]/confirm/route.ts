import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendConfirmedQuote } from "@/lib/notifications";
import { hasFeature } from "@/lib/plans";
import type { Plan, Quote, Tenant } from "@/types/database";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const confirmedPrice = Number(body?.confirmedPrice);
  if (!confirmedPrice || confirmedPrice <= 0) {
    return NextResponse.json({ error: "Enter a valid price" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // RLS (is_tenant_member) ensures this only succeeds for the lead's own tenant staff.
  const { data: quote, error } = await supabase
    .from("quotes")
    .update({ confirmed_price: confirmedPrice, confirmed_by: user.id, confirmed_at: new Date().toISOString(), status: "confirmed" })
    .eq("id", id)
    .select()
    .single<Quote>();

  if (error || !quote) {
    return NextResponse.json({ error: error?.message ?? "Could not confirm this lead" }, { status: 400 });
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();

  if (tenant) {
    await sendConfirmedQuote(tenant, quote, hasFeature(plan, "sms_notifications"));
    await supabase.from("quotes").update({ status: "sent" }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
