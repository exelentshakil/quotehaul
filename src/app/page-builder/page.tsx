import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { PageLayout, Plan, Tenant } from "@/types/database";
import { PuckEditor } from "@/components/puck-editor";
import { RICH_DEFAULT_CONTENT } from "@/lib/puck-config";
import { searchPhoto, injectHeroPhoto } from "@/lib/unsplash";

export default async function PageBuilderPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;

  const supabase = await createClient();
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();
  if (!tenant) return <p>No company found.</p>;

  if (plan?.slug !== "paid") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-2 text-xl font-bold">The page builder is a Pro feature</h1>
        <p className="mb-4 text-sm text-muted-foreground">Upgrade to visually design your landing page.</p>
        <Link href="/dashboard/settings" className="text-primary hover:underline">Back to Settings</Link>
      </div>
    );
  }

  const [{ data: versionsResult }, { data: faqItems }] = await Promise.all([
    supabase.from("page_layouts").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).returns<PageLayout[]>(),
    supabase.from("faq_items").select("question, answer").eq("tenant_id", tenant.id).order("sort_order"),
  ]);

  let versions = versionsResult ?? [];
  let activeVersionId = tenant.active_page_layout_id;

  // First-ever visit: give the tenant a real photo by default instead of the
  // plain gradient placeholder, so the page looks finished, not started.
  if (versions.length === 0) {
    const photo = await searchPhoto("moving company house removal truck");
    const content = injectHeroPhoto(RICH_DEFAULT_CONTENT, photo);
    const { data: version } = await supabase
      .from("page_layouts")
      .insert({ tenant_id: tenant.id, name: "Original", data: { content, root: {}, zones: {} } })
      .select()
      .single<PageLayout>();
    if (version) {
      versions = [version];
      activeVersionId = version.id;
      await supabase.from("tenants").update({ active_page_layout_id: version.id }).eq("id", tenant.id);
    }
  }

  return (
    <PuckEditor
      tenantSlug={tenant.slug}
      faqItems={faqItems ?? []}
      versions={versions}
      activeVersionId={activeVersionId}
    />
  );
}
