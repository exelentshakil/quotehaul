import { notFound } from "next/navigation";
import Link from "next/link";
import { Render } from "@measured/puck";
import { ShieldCheck, MapPin, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tenantThemeStyle } from "@/lib/color";
import { ChatWidget } from "@/components/chat-widget";
import { TenantNav } from "@/components/tenant-nav";
import { puckConfig } from "@/lib/puck-config";
import { getTenantForPublicPage } from "@/lib/tenant-public";

export default async function TenantLandingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const result = await getTenantForPublicPage(slug);
  if (!result) return notFound();
  const { tenant, plan, faqItems, pageLayout, pages } = result;
  const showBadge = !plan?.features.remove_platform_badge;

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen">
      <TenantNav tenantSlug={slug} companyName={tenant.company_name} phone={tenant.branding?.phone ?? null} pages={pages} />

      <div className="mx-auto max-w-3xl px-6 py-16">
        {pageLayout && plan?.slug === "paid" ? (
          <Render config={puckConfig} data={pageLayout} metadata={{ tenantSlug: slug, faqItems }} />
        ) : (
          <>
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
          </>
        )}

        {plan?.features.content_pages && (
          <nav className="mt-12 flex gap-6 text-sm text-muted-foreground">
            <Link href={`/${slug}/faq`} className="hover:underline">FAQ</Link>
            <Link href={`/${slug}/checklist`} className="hover:underline">Moving checklist</Link>
            {plan?.features.saved_quote_retrieval && (
              <Link href={`/${slug}/retrieve`} className="hover:underline">Retrieve a saved quote</Link>
            )}
          </nav>
        )}

        {showBadge && <p className="mt-16 text-xs text-muted-foreground">Powered by QuoteHaul</p>}
      </div>

      {plan?.slug === "paid" && <ChatWidget tenantSlug={slug} companyName={tenant.company_name} />}
    </main>
  );
}
