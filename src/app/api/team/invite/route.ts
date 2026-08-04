import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { DEFAULT_STAFF_PERMISSIONS } from "@/lib/permissions";

// Owner-only. Uses Supabase Auth's built-in invite flow (creates the user
// and emails them a sign-in link) rather than generating and mailing a
// temporary password ourselves — reuses what Supabase already provides.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const membership = await getTenantMembership(user.id);
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });
  if (membership.role !== "owner") return NextResponse.json({ error: "Only the account owner can invite team members" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const email = (body?.email as string)?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  const supabase = await createClient();
  const { data: tenant } = await supabase.from("tenants").select("company_name").eq("id", membership.tenant_id).single();

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/team/accept`,
    data: { invited_to_company: tenant?.company_name ?? "" },
  });
  if (error || !invited.user) {
    const alreadyExists = error?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      { error: alreadyExists ? "That email already has an account — they can't be invited to a second company yet." : (error?.message ?? "Could not send the invite") },
      { status: 400 }
    );
  }

  const { error: memberError } = await admin.from("tenant_users").insert({
    tenant_id: membership.tenant_id,
    user_id: invited.user.id,
    role: "staff",
    permissions: DEFAULT_STAFF_PERMISSIONS,
  });
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
