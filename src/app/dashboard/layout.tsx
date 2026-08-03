import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(company_name, slug, subscription_status, trial_ends_at)")
    .eq("user_id", user.id)
    .maybeSingle();

  const tenant = membership?.tenants as unknown as
    | { company_name: string; slug: string; subscription_status: string | null; trial_ends_at: string | null }
    | undefined;

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
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">QuoteHaul dashboard</p>
            <p className="font-semibold">{tenant?.company_name ?? "Your company"}</p>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:underline">Leads</Link>
            <Link href="/dashboard/capacity" className="hover:underline">Capacity</Link>
            <Link href="/dashboard/settings" className="hover:underline">Settings</Link>
            {tenant?.slug && (
              <a href={`/${tenant.slug}`} target="_blank" className="hover:underline">View public funnel ↗</a>
            )}
            <form action="/api/logout" method="post">
              <button className="hover:underline">Log out</button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
