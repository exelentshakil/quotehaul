import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID = ["new", "pending_confirmation", "confirmed", "sent", "booked", "lost"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!VALID.includes(body?.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ status: body.status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
