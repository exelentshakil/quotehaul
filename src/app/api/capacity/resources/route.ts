import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getTenantId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  return data?.tenant_id ?? null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error } = await supabase.from("capacity_resources").insert({
    tenant_id: tenantId,
    name: body.name,
    crew_hours_per_day: body.crewHoursPerDay ?? 8,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("capacity_resources").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
