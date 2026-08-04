import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getTenantId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  return data?.tenant_id ?? null;
}

// Saves a version's content. With a versionId, updates that row (used by
// Puck's own Publish action while editing a version). Without one, creates a
// new named version (used by "Save as new version").
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.data) return NextResponse.json({ error: "Missing layout data" }, { status: 400 });

  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (body.versionId) {
    const { error } = await supabase.from("page_layouts").update({ data: body.data }).eq("id", body.versionId).eq("tenant_id", tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (body.makeActive) await supabase.from("tenants").update({ active_page_layout_id: body.versionId }).eq("id", tenantId);
    return NextResponse.json({ ok: true, versionId: body.versionId });
  }

  const { data: version, error } = await supabase
    .from("page_layouts")
    .insert({ tenant_id: tenantId, name: body.name?.trim() || "Untitled", data: body.data })
    .select()
    .single();
  if (error || !version) return NextResponse.json({ error: error?.message ?? "Could not save" }, { status: 400 });
  if (body.makeActive) await supabase.from("tenants").update({ active_page_layout_id: version.id }).eq("id", tenantId);
  return NextResponse.json({ ok: true, versionId: version.id });
}

export async function DELETE(req: Request) {
  const { versionId } = await req.json().catch(() => ({}));
  if (!versionId) return NextResponse.json({ error: "Missing versionId" }, { status: 400 });

  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await supabase.from("tenants").update({ active_page_layout_id: null }).eq("id", tenantId).eq("active_page_layout_id", versionId);
  const { error } = await supabase.from("page_layouts").delete().eq("id", versionId).eq("tenant_id", tenantId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
