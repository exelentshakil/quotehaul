import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (body?.data) update.data = body.data;
  if (typeof body?.isPublished === "boolean") update.is_published = body.isPublished;
  if (body?.navLabel !== undefined) update.nav_label = body.navLabel;
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to save" }, { status: 400 });

  const { error } = await supabase.from("page_layouts").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("page_layouts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
