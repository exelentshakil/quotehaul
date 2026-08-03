import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tenant } from "@/types/database";
import { tenantThemeStyle } from "@/lib/color";
import QuoteForm from "./QuoteForm";

export default async function QuotePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return notFound();

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-xl px-6 py-16">
        <header className="mb-8 flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">{tenant.company_name}</span>
          {tenant.branding?.phone && (
            <a href={`tel:${tenant.branding.phone}`} className="flex items-center gap-1.5 text-sm font-medium hover:underline">
              <Phone className="h-4 w-4" /> {tenant.branding.phone}
            </a>
          )}
        </header>
        <QuoteForm tenantSlug={slug} />
      </div>
    </main>
  );
}
