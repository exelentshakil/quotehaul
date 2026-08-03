import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Switches which saved version is live, without touching any version's data.
export async function POST(req: Request) {
  const { versionId } = await req.json().catch(() => ({}));
  if (!versionId) return NextResponse.json({ error: "Missing versionId" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const { error } = await supabase.from("tenants").update({ active_page_layout_id: versionId }).eq("id", membership.tenant_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
