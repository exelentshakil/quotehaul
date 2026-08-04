import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDomainToProject, removeDomainFromProject, getDomainStatus } from "@/lib/vercel";

async function getTenantId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  return data?.tenant_id ?? null;
}

export async function POST(req: Request) {
  const { domain } = await req.json().catch(() => ({}));
  if (!domain?.trim()) return NextResponse.json({ error: "Enter a domain" }, { status: 400 });

  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const result = await addDomainToProject(domain.trim());
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error } = await supabase.from("tenants").update({ custom_domain: domain.trim(), custom_domain_status: "pending" }).eq("id", tenantId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: tenant } = await supabase.from("tenants").select("custom_domain").eq("id", tenantId).single();
  if (!tenant?.custom_domain) return NextResponse.json({ status: null });

  const status = await getDomainStatus(tenant.custom_domain);
  const newStatus = status?.verified ? "verified" : "pending";
  await supabase.from("tenants").update({ custom_domain_status: newStatus }).eq("id", tenantId);
  return NextResponse.json({ status: newStatus });
}

export async function DELETE() {
  const supabase = await createClient();
  const tenantId = await getTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: tenant } = await supabase.from("tenants").select("custom_domain").eq("id", tenantId).single();
  if (tenant?.custom_domain) await removeDomainFromProject(tenant.custom_domain);

  await supabase.from("tenants").update({ custom_domain: null, custom_domain_status: null }).eq("id", tenantId);
  return NextResponse.json({ ok: true });
}
