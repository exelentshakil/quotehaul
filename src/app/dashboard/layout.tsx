import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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
    <SidebarProvider>
      <AppSidebar companyName={tenant?.company_name ?? "Your company"} userEmail={user.email ?? ""} tenantSlug={tenant?.slug} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          {isTrialing ? (
            <p className="text-sm text-muted-foreground">
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your Pro trial —{" "}
              <Link href="/dashboard/settings" className="font-medium text-primary underline-offset-2 hover:underline">manage billing</Link>
            </p>
          ) : (
            <p className="text-sm font-medium">{tenant?.company_name ?? "Your company"}</p>
          )}
        </header>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
