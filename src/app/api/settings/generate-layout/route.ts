import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePageLayout } from "@/lib/ai";
import type { Tenant } from "@/types/database";

// Creates a new saved version from an AI prompt — never overwrites or
// activates an existing version, so a bad generation is always undoable by
// just not switching to it.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt?.trim()) return NextResponse.json({ error: "Describe what you want first" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const content = await generatePageLayout(tenant, body.prompt);

  const { data: version, error } = await supabase
    .from("page_layouts")
    .insert({ tenant_id: tenant.id, name: body.name?.trim() || `AI draft — ${new Date().toLocaleDateString()}`, data: { content, root: {}, zones: {} } })
    .select()
    .single();
  if (error || !version) return NextResponse.json({ error: error?.message ?? "Could not save the generated page" }, { status: 400 });

  return NextResponse.json({ ok: true, version });
}
