import Link from "next/link";
import { Phone } from "lucide-react";

export type TenantNavPage = { slug: string; nav_label: string | null; name: string };

// The tenant's own branded header — reused across the home page and every
// additional page (About/Services/Contact...) so navigation is consistent.
// Never shares markup with SiteHeader (the QuoteHaul marketing header) —
// a tenant's customers should only ever see the tenant's own brand.
export function TenantNav({ tenantSlug, companyName, phone, pages }: { tenantSlug: string; companyName: string; phone: string | null; pages: TenantNavPage[] }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href={`/${tenantSlug}`} className="text-lg font-semibold text-primary">{companyName}</Link>
        <nav className="flex flex-wrap items-center gap-5 text-sm">
          {pages.map((p) => (
            <Link key={p.slug} href={`/${tenantSlug}/p/${p.slug}`} className="text-muted-foreground hover:text-foreground hover:underline">
              {p.nav_label || p.name}
            </Link>
          ))}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 font-medium hover:underline">
              <Phone className="h-4 w-4" /> {phone}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
