import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { EmailTemplateType, Tenant } from "@/types/database";

const VALID_TYPES: EmailTemplateType[] = ["new_lead", "customer_receipt", "order_message", "confirmed_quote", "invoice"];

// Kept separate from the main /api/settings POST (branding/pricing) since
// this edits one template type at a time, not the whole settings form.
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const membership = await getTenantMembership(user.id);
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const type = body?.type as EmailTemplateType;
  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "Unknown template type" }, { status: 400 });

  const supabase = await createClient();
  const { data: tenant } = await supabase.from("tenants").select("email_templates").eq("id", membership.tenant_id).single<Pick<Tenant, "email_templates">>();
  const current = tenant?.email_templates ?? {};

  const nextTemplates = { ...current };
  if (body.reset) {
    delete nextTemplates[type];
  } else {
    const subject = (body.subject as string)?.trim();
    const templateBody = (body.body as string)?.trim();
    if (!subject || !templateBody) return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    nextTemplates[type] = { subject, body: templateBody };
  }

  const { error } = await supabase.from("tenants").update({ email_templates: nextTemplates }).eq("id", membership.tenant_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
