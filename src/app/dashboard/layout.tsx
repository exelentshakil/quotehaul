import Link from "next/link";
import { redirect } from "next/navigation";
import { Truck, LogOut } from "lucide-react";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { DashboardNav } from "@/components/dashboard-nav";
import { Avatar } from "@/components/ui/avatar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  const tenant = membership?.tenants;

  const isTrialing = tenant?.subscription_status === "trialing";
  const trialDaysLeft = isTrialing && tenant?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {isTrialing && (
        <div className="bg-primary px-6 py-2 text-center text-sm text-primary-foreground">
          {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your Pro trial —{" "}
          <Link href="/dashboard/settings" className="underline underline-offset-2">manage billing</Link>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">QuoteHaul</p>
              <p className="text-sm font-semibold leading-tight">{tenant?.company_name ?? "Your company"}</p>
            </div>
          </div>

          <DashboardNav tenantSlug={tenant?.slug} />

          <div className="flex items-center gap-3">
            <Avatar name={tenant?.company_name ?? "?"} />
            <form action="/api/logout" method="post">
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" aria-label="Log out" title="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
