import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PageLayout, Plan, Tenant } from "@/types/database";
import { PuckEditor } from "@/components/puck-editor";

export default async function PageBuilderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return <p>No company found for your account.</p>;

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

  const [{ data: versions }, { data: faqItems }] = await Promise.all([
    supabase.from("page_layouts").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).returns<PageLayout[]>(),
    supabase.from("faq_items").select("question, answer").eq("tenant_id", tenant.id).order("sort_order"),
  ]);

  return (
    <PuckEditor
      tenantSlug={tenant.slug}
      faqItems={faqItems ?? []}
      versions={versions ?? []}
      activeVersionId={tenant.active_page_layout_id}
    />
  );
}
