import { notFound } from "next/navigation";
import Link from "next/link";
import { Render, type Data } from "@puckeditor/core";
import { ShieldCheck, MapPin, Zap, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tenantThemeStyle } from "@/lib/color";
import { ChatWidget } from "@/components/chat-widget";
import { TenantNav } from "@/components/tenant-nav";
import { puckConfig } from "@/lib/puck-config";
import { getTenantForPublicPage } from "@/lib/tenant-public";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";

// A staff-only preview of a not-yet-live draft version — never leaks a
// tenant's unpublished draft to the public, since it requires the requester
// to be a signed-in member of that exact tenant.
async function getPreviewData(tenantId: string, versionId: string): Promise<Data | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const membership = await getTenantMembership(user.id);
  if (membership?.tenant_id !== tenantId) return null;

  const admin = createAdminClient();
  const { data } = await admin.from("page_layouts").select("data").eq("id", versionId).eq("tenant_id", tenantId).maybeSingle();
  return (data?.data as Data) ?? null;
}

export default async function TenantLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { tenant: slug } = await params;
  const { preview } = await searchParams;
  const result = await getTenantForPublicPage(slug);
  if (!result) return notFound();
  const { tenant, plan, faqItems, pageLayout, pages } = result;
  const showBadge = !plan?.features.remove_platform_badge;

  const previewData = preview ? await getPreviewData(tenant.id, preview) : null;
  const displayData = previewData ?? pageLayout;

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen">
      {previewData && (
        <div className="flex items-center justify-center gap-1.5 bg-warning py-2 text-center text-sm font-medium text-warning-foreground">
          <Eye className="h-3.5 w-3.5" /> Previewing a draft — this isn&apos;t live yet
        </div>
      )}
      <TenantNav tenantSlug={slug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages} />

      {displayData && plan?.slug === "paid" ? (
        // Full-width — every Puck block manages its own inner max-width and
        // padding, so section backgrounds can span the full browser width.
        <Render config={puckConfig} data={displayData} metadata={{ tenantSlug: slug, faqItems }} />
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Moving house? Get an instant estimate in 60 seconds.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Fill in one quick form and we&apos;ll come back with your best price. Free and no obligation —
            a real person confirms every quote before anything is booked.
          </p>

          <Button asChild size="lg" className="mt-8">
            <Link href={`/${slug}/quote`}>Get my estimate — free & instant</Link>
          </Button>

          <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Free & no obligation</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Local & long-distance moves</li>
            <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant online estimate</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Your details stay private</li>
          </ul>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 pb-16">
        {plan?.features.content_pages && (
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href={`/${slug}/faq`} className="hover:underline">FAQ</Link>
            <Link href={`/${slug}/checklist`} className="hover:underline">Moving checklist</Link>
            {plan?.features.saved_quote_retrieval && (
              <Link href={`/${slug}/retrieve`} className="hover:underline">Retrieve a saved quote</Link>
            )}
          </nav>
        )}

        {showBadge && <p className="mt-4 text-xs text-muted-foreground">Powered by QuoteHaul</p>}
      </div>

      {plan?.slug === "paid" && <ChatWidget tenantSlug={slug} companyName={tenant.company_name} />}
    </main>
  );
}
