import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccess, type Permissions, type PermissionSection } from "@/lib/permissions";

// React's cache() dedupes by args within a single request — the layout and
// the page both need the current user and tenant membership, and without
// this they each re-fetch both from scratch, turning every dashboard
// navigation into several redundant sequential round trips.
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getTenantMembership = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenant_users")
    .select("tenant_id, role, permissions, tenants(company_name, slug, subscription_status, trial_ends_at)")
    .eq("user_id", userId)
    .maybeSingle();
  return data as {
    tenant_id: string;
    role: string;
    permissions: Permissions | null;
    tenants: { company_name: string; slug: string; subscription_status: string | null; trial_ends_at: string | null };
  } | null;
});

// Server-side page guard — sidebar filtering alone only hides a link, it
// doesn't stop a direct URL visit, so every permission-gated dashboard page
// calls this before rendering.
export async function requireSection(section: PermissionSection) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const membership = await getTenantMembership(user.id);
  if (!membership || !canAccess(membership, section)) redirect("/dashboard");
  return { user, membership };
}
