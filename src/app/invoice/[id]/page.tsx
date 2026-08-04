import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantThemeStyle } from "@/lib/color";
import type { Invoice, Quote, Tenant } from "@/types/database";
import { PrintButton } from "@/components/print-button";

// Public by design (a magic-link-style resource, same trust model as the
// saved-quote retrieval token) — the customer receiving this link is never
// signed in. Printable/savable as PDF via the browser's own print dialog,
// no PDF-generation dependency needed.
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: invoice } = await admin.from("invoices").select("*").eq("id", id).maybeSingle<Invoice>();
  if (!invoice) return notFound();

  const [{ data: tenant }, { data: quote }] = await Promise.all([
    admin.from("tenants").select("*").eq("id", invoice.tenant_id).single<Tenant>(),
    admin.from("quotes").select("*").eq("id", invoice.quote_id).single<Quote>(),
  ]);
  if (!tenant || !quote) return notFound();

  const invoiceNumber = invoice.id.slice(0, 8).toUpperCase();

  return (
    <main style={tenantThemeStyle(tenant.branding?.primary_color)} className="min-h-screen bg-muted/30 px-6 py-12 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-card print:rounded-none print:border-0 print:shadow-none sm:p-12">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-8">
          <div className="flex items-center gap-3">
            {tenant.branding?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.branding.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-lg font-semibold">{tenant.company_name}</p>
              {tenant.branding?.phone && <p className="text-sm text-muted-foreground">{tenant.branding.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Invoice</p>
            <p className="text-xs text-muted-foreground">#{invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">{new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billed to</p>
            <p className="mt-1 font-medium">{quote.customer_name ?? "Customer"}</p>
            {quote.customer_email && <p className="text-sm text-muted-foreground">{quote.customer_email}</p>}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Move</p>
            <p className="mt-1 text-sm">{quote.from_postcode} → {quote.to_postcode}</p>
            {quote.move_date && <p className="text-sm text-muted-foreground">{quote.move_date}</p>}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-4">{invoice.label}</td>
                <td className="px-4 py-4 text-right font-semibold">£{invoice.amount.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-4 py-3 font-semibold">Total due</td>
                <td className="px-4 py-3 text-right text-lg font-bold text-primary">£{invoice.amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.instructions && (
          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment instructions</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{invoice.instructions}</p>
          </div>
        )}

        <PrintButton />
      </div>
    </main>
  );
}
