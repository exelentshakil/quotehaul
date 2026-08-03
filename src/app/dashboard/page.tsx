import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote, QuoteStatus } from "@/types/database";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New",
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  sent: "Sent",
  booked: "Booked",
  lost: "Lost",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return <p>No company found for your account.</p>;

  let query = supabase.from("quotes").select("*").eq("tenant_id", membership.tenant_id).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: quotes } = await query.returns<Quote[]>();

  const counts: Record<string, number> = {};
  for (const s of Object.keys(STATUS_LABELS)) counts[s] = 0;
  (quotes ?? []).forEach((q) => (counts[q.status] = (counts[q.status] ?? 0) + 1));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard" className={`rounded-full border px-3 py-1 ${!status ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>
          All
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link key={key} href={`/dashboard?status=${key}`} className={`rounded-full border px-3 py-1 ${status === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>
            {label} ({counts[key] ?? 0})
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Estimate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {(quotes ?? []).map((q) => (
              <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/leads/${q.id}`} className="font-medium hover:underline">
                    {q.customer_name || "(no details yet)"}
                  </Link>
                  <p className="text-xs text-slate-500">{q.customer_phone}</p>
                </td>
                <td className="px-4 py-3">{q.from_postcode} → {q.to_postcode}</td>
                <td className="px-4 py-3">
                  {q.confirmed_price ? `£${q.confirmed_price}` : `£${q.estimate_low}–£${q.estimate_high}`}
                </td>
                <td className="px-4 py-3">{STATUS_LABELS[q.status]}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(q.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(quotes ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
