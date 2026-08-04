import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { PERMISSION_SECTIONS, type Permissions } from "@/lib/permissions";

async function requireOwner() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  const membership = await getTenantMembership(user.id);
  if (!membership) return { error: NextResponse.json({ error: "No company found" }, { status: 404 }) };
  if (membership.role !== "owner") return { error: NextResponse.json({ error: "Only the account owner can manage team members" }, { status: 403 }) };
  return { membership };
}

// Owner-only: update a staff member's per-section permissions.
export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { membership, error } = await requireOwner();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const incoming = body?.permissions as Partial<Permissions> | undefined;
  if (!incoming) return NextResponse.json({ error: "Missing permissions" }, { status: 400 });

  const permissions: Permissions = PERMISSION_SECTIONS.reduce((acc, section) => {
    acc[section] = Boolean(incoming[section]);
    return acc;
  }, {} as Permissions);

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("tenant_users")
    .update({ permissions })
    .eq("tenant_id", membership!.tenant_id)
    .eq("user_id", userId)
    .eq("role", "staff");
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// Owner-only: revoke a staff member's access to this tenant (removes the
// membership row, doesn't delete their underlying auth account).
export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { membership, error } = await requireOwner();
  if (error) return error;

  const admin = createAdminClient();
  const { error: deleteError } = await admin
    .from("tenant_users")
    .delete()
    .eq("tenant_id", membership!.tenant_id)
    .eq("user_id", userId)
    .eq("role", "staff");
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
