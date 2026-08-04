import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tenant } from "@/types/database";
import { tenantThemeStyle } from "@/lib/color";
import { TenantNav } from "@/components/tenant-nav";
import { TenantFooter } from "@/components/tenant-footer";
import QuoteForm from "./QuoteForm";

export default async function QuotePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return notFound();
  const { data: pages } = await admin.from("page_layouts").select("slug, nav_label, name").eq("tenant_id", tenant.id).eq("is_published", true).not("slug", "is", null);

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="flex min-h-screen flex-col">
      <TenantNav tenantSlug={slug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages ?? []} />
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
        <QuoteForm tenantSlug={slug} />
      </div>
      <TenantFooter companyName={tenant.company_name} />
    </main>
  );
}
