import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { canAccess, DEFAULT_STAFF_PERMISSIONS, type Permissions } from "@/lib/permissions";
import { TeamManager, type TeamMember } from "@/components/team-manager";

export default async function TeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;
  if (!canAccess(membership, "team")) redirect("/dashboard");

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("tenant_users")
    .select("user_id, role, permissions")
    .eq("tenant_id", membership.tenant_id)
    .order("role", { ascending: true });

  const members: TeamMember[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data } = await admin.auth.admin.getUserById(row.user_id);
      return {
        userId: row.user_id,
        email: data.user?.email ?? "unknown",
        avatarUrl: (data.user?.user_metadata?.avatar_url as string | undefined) ?? null,
        role: row.role as "owner" | "staff",
        permissions: (row.permissions as Permissions | null) ?? DEFAULT_STAFF_PERMISSIONS,
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>
      <TeamManager members={members} isOwner={membership.role === "owner"} currentUserId={user.id} />
    </div>
  );
}
