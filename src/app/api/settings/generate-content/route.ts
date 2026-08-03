import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOnboardingContent } from "@/lib/ai";
import type { Tenant } from "@/types/database";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const content = await generateOnboardingContent(tenant);

  await supabase.from("faq_items").delete().eq("tenant_id", tenant.id);
  await supabase.from("faq_items").insert(content.faq.map((f, i) => ({ tenant_id: tenant.id, question: f.question, answer: f.answer, sort_order: i })));

  await supabase.from("content_pages").upsert(
    { tenant_id: tenant.id, type: "checklist", title: "Moving day checklist", content: content.checklist, published: true },
    { onConflict: "tenant_id,type" }
  );
  await supabase.from("content_pages").upsert(
    { tenant_id: tenant.id, type: "ad_copy", title: "Starter ad copy", content: content.adCopy, published: false },
    { onConflict: "tenant_id,type" }
  );

  return NextResponse.json({ ok: true, adCopy: content.adCopy });
}
