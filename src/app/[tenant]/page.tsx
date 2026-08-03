import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, ShieldCheck, MapPin, Zap, Lock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Tenant } from "@/types/database";
import { Button } from "@/components/ui/button";
import { tenantThemeStyle } from "@/lib/color";

async function getTenant(slug: string) {
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return null;
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  return { tenant, plan };
}

export default async function TenantLandingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const result = await getTenant(slug);
  if (!result) return notFound();
  const { tenant, plan } = result;
  const phone = tenant.branding?.phone;
  const showBadge = !plan?.features.remove_platform_badge;

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-primary">{tenant.company_name}</span>
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm font-medium hover:underline">
              <Phone className="h-4 w-4" /> {phone}
            </a>
          )}
        </div>
      </header>

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
    </main>
  );
}
