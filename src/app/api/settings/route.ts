import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  await supabase
    .from("tenants")
    .update({
      company_name: body.companyName,
      branding: { primary_color: body.primaryColor, phone: body.phone, logo_url: body.logoUrl || null },
    })
    .eq("id", membership.tenant_id);

  await supabase
    .from("rate_configs")
    .update({
      rate_per_mile: body.ratePerMile,
      minimum_job_price: body.minimumJobPrice,
      service_radius_miles: body.serviceRadius,
    })
    .eq("tenant_id", membership.tenant_id);

  return NextResponse.json({ ok: true });
}
