import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { canAccess } from "@/lib/permissions";
import type { Quote } from "@/types/database";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

type Customer = {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  moves: number;
  totalSpend: number;
  lastContact: string;
  latestQuoteId: string;
};

export default async function CustomersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;
  if (!canAccess(membership, "customers")) redirect("/dashboard");

  const supabase = await createClient();
  const { data: quotesData } = await supabase
    .from("quotes")
    .select("*")
    .eq("tenant_id", membership.tenant_id)
    .eq("status", "booked")
    .order("updated_at", { ascending: false })
    .returns<Quote[]>();

  const quotes = quotesData ?? [];

  // Derived entirely from booked quotes — a customer is anyone who's booked
  // at least once, deduped by email (falling back to phone when no email).
  const byKey = new Map<string, Customer>();
  for (const q of quotes) {
    const key = q.customer_email?.toLowerCase() || q.customer_phone || q.id;
    const existing = byKey.get(key);
    const spend = q.confirmed_price ?? q.estimate_high ?? 0;
    if (existing) {
      existing.moves += 1;
      existing.totalSpend += spend;
      if (new Date(q.updated_at) > new Date(existing.lastContact)) {
        existing.lastContact = q.updated_at;
        existing.latestQuoteId = q.id;
        existing.name = q.customer_name ?? existing.name;
      }
    } else {
      byKey.set(key, {
        key,
        name: q.customer_name ?? "Customer",
        email: q.customer_email,
        phone: q.customer_phone,
        moves: 1,
        totalSpend: spend,
        lastContact: q.updated_at,
        latestQuoteId: q.id,
      });
    }
  }
  const customers = [...byKey.values()].sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const repeatCustomers = customers.filter((c) => c.moves > 1).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Customers" value={customers.length} />
        <StatCard label="Repeat customers" value={repeatCustomers} />
        <StatCard label="Lifetime revenue" value={`£${totalRevenue.toLocaleString()}`} hint="Confirmed prices, or estimate high" />
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" body="Once a lead's status is set to Booked, they'll show up here as a customer." />
      ) : (
        <Card className="shadow-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Customer</span>
            <span>Moves</span>
            <span>Total spend</span>
            <span>Last contact</span>
          </div>
          <ul className="divide-y divide-border">
            {customers.map((c) => (
              <li key={c.key}>
                <Link href={`/dashboard/leads/${c.latestQuoteId}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-accent/50">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={c.name} className="h-8 w-8 text-xs" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.email ?? c.phone ?? "—"}</p>
                    </div>
                  </div>
                  <span className="text-sm">{c.moves}</span>
                  <span className="text-sm font-medium">£{c.totalSpend.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.lastContact).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
