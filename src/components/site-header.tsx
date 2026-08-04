import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

// The marketing-site header — used on the home, login, and signup pages
// only. Tenant public funnel pages have their own tenant-branded header
// (src/app/[tenant]/page.tsx) and must never render this one.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold">
          <Truck className="h-5 w-5 text-primary" />
          QuoteHaul
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/#pricing" className="hidden text-muted-foreground hover:text-foreground sm:inline">Pricing</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Log in</Link>
          <Button asChild size="sm">
            <Link href="/signup">Start free trial</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
