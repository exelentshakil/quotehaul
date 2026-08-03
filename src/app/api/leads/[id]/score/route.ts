import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreLeadAndDraftFollowUp } from "@/lib/ai";
import type { Quote, Tenant } from "@/types/database";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", quote.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const result = await scoreLeadAndDraftFollowUp(quote, tenant);

  const { error } = await supabase.from("lead_scores").upsert({
    quote_id: id,
    tenant_id: quote.tenant_id,
    score: result.score,
    factors: result.factors,
    follow_up_draft: result.followUpDraft,
    generated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(result);
}
