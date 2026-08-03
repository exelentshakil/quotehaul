import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { answerFunnelQuestion } from "@/lib/ai";
import type { Plan, Tenant } from "@/types/database";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.tenantSlug || !body?.message?.trim()) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", body.tenantSlug).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Unknown company" }, { status: 404 });
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  if (plan?.slug !== "paid") return NextResponse.json({ error: "Chat isn't available for this company" }, { status: 403 });

  const { data: faq } = await admin.from("faq_items").select("question, answer").eq("tenant_id", tenant.id).order("sort_order");

  const reply = await answerFunnelQuestion(tenant, faq ?? [], body.message, body.history ?? []);
  return NextResponse.json({ reply });
}
