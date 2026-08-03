import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.note?.trim()) return NextResponse.json({ error: "Note is empty" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: quote } = await supabase.from("quotes").select("tenant_id").eq("id", id).single();
  if (!quote) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { error } = await supabase.from("quote_notes").insert({
    quote_id: id,
    tenant_id: quote.tenant_id,
    user_id: user?.id ?? null,
    note: body.note,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
