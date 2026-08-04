import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
    .select("tenant_id, tenants(company_name, slug, subscription_status, trial_ends_at)")
    .eq("user_id", userId)
    .maybeSingle();
  return data as { tenant_id: string; tenants: { company_name: string; slug: string; subscription_status: string | null; trial_ends_at: string | null } } | null;
});
