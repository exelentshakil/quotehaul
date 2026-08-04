import { notFound } from "next/navigation";
import { Render, type Data } from "@puckeditor/core";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantThemeStyle } from "@/lib/color";
import { TenantNav } from "@/components/tenant-nav";
import { ChatWidget } from "@/components/chat-widget";
import { puckConfig } from "@/lib/puck-config";
import { getTenantForPublicPage } from "@/lib/tenant-public";

export default async function TenantSecondaryPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant: tenantSlug, slug } = await params;
  const result = await getTenantForPublicPage(tenantSlug);
  if (!result || result.plan?.slug !== "paid") return notFound();
  const { tenant, plan, faqItems, pages } = result;

  const admin = createAdminClient();
  const { data: page } = await admin
    .from("page_layouts")
    .select("data")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!page) return notFound();

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen">
      <TenantNav tenantSlug={tenantSlug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages} />
      <Render config={puckConfig} data={page.data as Data} metadata={{ tenantSlug, faqItems }} />
      {plan?.slug === "paid" && <ChatWidget tenantSlug={tenantSlug} companyName={tenant.company_name} />}
    </main>
  );
}
