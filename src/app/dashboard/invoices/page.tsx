import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { canAccess } from "@/lib/permissions";
import type { Invoice, Quote } from "@/types/database";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt, ExternalLink } from "lucide-react";

export default async function InvoicesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;
  if (!canAccess(membership, "invoices")) redirect("/dashboard");

  const supabase = await createClient();
  const { data: invoicesData } = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", membership.tenant_id)
    .order("created_at", { ascending: false })
    .returns<Invoice[]>();
  const invoices = invoicesData ?? [];

  const quoteIds = [...new Set(invoices.map((i) => i.quote_id))];
  const { data: quotesData } = quoteIds.length
    ? await supabase.from("quotes").select("*").in("id", quoteIds).returns<Quote[]>()
    : { data: [] as Quote[] };
  const quoteById = new Map((quotesData ?? []).map((q) => [q.id, q]));

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Invoices sent" value={invoices.length} />
        <StatCard label="Total invoiced" value={`£${totalInvoiced.toLocaleString()}`} />
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices yet" body="Send an invoice from a lead's detail page and it'll show up here." />
      ) : (
        <Card className="shadow-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Customer</span>
            <span>Label</span>
            <span>Amount</span>
            <span>Date</span>
            <span></span>
          </div>
          <ul className="divide-y divide-border">
            {invoices.map((inv) => {
              const quote = quoteById.get(inv.quote_id);
              return (
                <li key={inv.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4">
                  <Link href={`/dashboard/leads/${inv.quote_id}`} className="min-w-0 truncate text-sm font-medium hover:underline">
                    {quote?.customer_name ?? "Customer"}
                  </Link>
                  <span className="text-sm text-muted-foreground">{inv.label}</span>
                  <span className="text-sm font-medium">£{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <a href={`/invoice/${inv.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
