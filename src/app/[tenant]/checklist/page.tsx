import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Tenant } from "@/types/database";
import { TenantNav } from "@/components/tenant-nav";
import { TenantFooter } from "@/components/tenant-footer";

const DEFAULT_CHECKLIST = [
  "8 weeks before: get your instant estimate and start comparing removal dates.",
  "4 weeks before: start using up food from the freezer and declutter rooms you rarely use.",
  "2 weeks before: confirm your exact price and booking, arrange parking permits if needed.",
  "1 week before: start packing non-essentials, label boxes by room.",
  "Moving day: keep essentials (documents, chargers, medication) in a separate bag.",
];

export default async function ChecklistPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return notFound();
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  if (!plan?.features.content_pages) return notFound();

  const { data: page } = await admin.from("content_pages").select("*").eq("tenant_id", tenant.id).eq("type", "checklist").maybeSingle();
  const items = page?.content ? JSON.parse(page.content) as string[] : DEFAULT_CHECKLIST;
  const { data: pages } = await admin.from("page_layouts").select("slug, nav_label, name").eq("tenant_id", tenant.id).eq("is_published", true).not("slug", "is", null);

  return (
    <main className="flex min-h-screen flex-col">
      <TenantNav tenantSlug={slug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages ?? []} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="mb-8 text-2xl font-bold">Your removals checklist</h1>
        <ol className="list-decimal space-y-3 pl-5 text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
      <TenantFooter companyName={tenant.company_name} />
    </main>
  );
}
