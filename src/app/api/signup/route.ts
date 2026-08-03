import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  planSlug: z.enum(["free", "paid"]).default("free"),
  phone: z.string().optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password, companyName, planSlug, phone } = parsed.data;

  const admin = createAdminClient();

  // 1. Create the auth user (email pre-confirmed so the trial starts instantly).
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError || !userData.user) {
    return NextResponse.json({ error: userError?.message ?? "Could not create account" }, { status: 400 });
  }

  // 2. Look up the Free plan. Tenants always start Free in the DB — moving to
  // Paid only ever happens via the Stripe webhook once a subscription is active.
  const { data: plan, error: planError } = await admin.from("plans").select("id").eq("slug", "free").single();
  if (planError || !plan) {
    return NextResponse.json({ error: "Could not set up plan" }, { status: 400 });
  }

  // 3. Create a unique tenant slug from the company name.
  const base = slugify(companyName) || "company";
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin.from("tenants").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // 4. Create the tenant, owner membership, and default rate config.
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      slug,
      company_name: companyName,
      plan_id: plan.id,
      branding: { primary_color: "#1d4ed8", logo_url: null, phone: phone ?? null },
    })
    .select()
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ error: tenantError?.message ?? "Could not create company" }, { status: 400 });
  }

  await admin.from("tenant_users").insert({ tenant_id: tenant.id, user_id: userData.user.id, role: "owner" });
  await admin.from("rate_configs").insert({ tenant_id: tenant.id });

  return NextResponse.json({ tenantSlug: tenant.id ? tenant.slug : null, wantsPaid: planSlug === "paid" });
}
