import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Tenant } from "@/types/database";
import type { Data } from "@puckeditor/core";

// Shared by every public tenant page ([tenant]/page.tsx and
// [tenant]/p/[slug]/page.tsx) — kept out of the page.tsx files themselves
// since Next.js route files may only export a small fixed set of names.
export async function getTenantForPublicPage(slug: string) {
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return null;
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  const { data: faqItems } = await admin.from("faq_items").select("question, answer").eq("tenant_id", tenant.id).order("sort_order");
  const { data: pages } = await admin.from("page_layouts").select("slug, nav_label, name").eq("tenant_id", tenant.id).eq("is_published", true).not("slug", "is", null);
  let pageLayout: Data | null = null;
  if (tenant.active_page_layout_id) {
    const { data: version } = await admin.from("page_layouts").select("data").eq("id", tenant.active_page_layout_id).maybeSingle();
    pageLayout = (version?.data as Data) ?? null;
  }
  return { tenant, plan, faqItems: faqItems ?? [], pageLayout, pages: pages ?? [] };
}
