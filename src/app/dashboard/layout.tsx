import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("tenant_id, tenants(company_name, slug)")
    .eq("user_id", user.id)
    .maybeSingle();

  const tenant = membership?.tenants as unknown as { company_name: string; slug: string } | undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">QuoteHaul dashboard</p>
            <p className="font-semibold">{tenant?.company_name ?? "Your company"}</p>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/dashboard" className="hover:underline">Leads</Link>
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
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
