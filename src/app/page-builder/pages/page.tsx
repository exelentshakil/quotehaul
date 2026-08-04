import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PageLayout, Plan, Tenant } from "@/types/database";
import { PagesList } from "@/components/pages-list";

export default async function PagesPage() {
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
        <h1 className="mb-2 text-xl font-bold">Extra pages are a Pro feature</h1>
        <Link href="/dashboard/settings" className="text-primary hover:underline">Back to Settings</Link>
      </div>
    );
  }

  const { data: pages } = await supabase
    .from("page_layouts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .returns<PageLayout[]>();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/page-builder" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to home page editor
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Pages</h1>
      <PagesList tenantSlug={tenant.slug} pages={pages ?? []} />
    </div>
  );
}
