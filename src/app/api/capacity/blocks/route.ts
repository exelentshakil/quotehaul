import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sets or clears a manual override for a date. `isOpen: null` clears the
// override and returns the day to computed (automatic) availability.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  if (body.isOpen === null) {
    const { error } = await supabase.from("capacity_blocks").delete().eq("tenant_id", membership.tenant_id).eq("date", body.date);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("capacity_blocks")
    .upsert({ tenant_id: membership.tenant_id, date: body.date, is_open: body.isOpen }, { onConflict: "tenant_id,date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
