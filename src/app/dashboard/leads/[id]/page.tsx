import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/types/database";
import ConfirmForm from "./ConfirmForm";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single<Quote>();
  if (!quote) return notFound();

  const { data: notes } = await supabase.from("quote_notes").select("*").eq("quote_id", id).order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="sm:col-span-2 space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold">{quote.customer_name || "Unnamed lead"}</h1>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Phone</dt><dd>{quote.customer_phone || "—"}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd>{quote.customer_email || "—"}</dd></div>
            <div><dt className="text-slate-500">From</dt><dd>{quote.from_postcode} {quote.from_town}</dd></div>
            <div><dt className="text-slate-500">To</dt><dd>{quote.to_postcode} {quote.to_town}</dd></div>
            <div><dt className="text-slate-500">Move date</dt><dd>{quote.move_date || "Flexible"}</dd></div>
            <div><dt className="text-slate-500">Property size</dt><dd>{quote.property_size}</dd></div>
            <div><dt className="text-slate-500">Distance</dt><dd>{quote.distance_miles?.toFixed(1)} mi {quote.is_sea_crossing ? "(sea crossing)" : ""}</dd></div>
            <div><dt className="text-slate-500">Source</dt><dd>{quote.source}</dd></div>
          </dl>
        </div>

        <ConfirmForm quote={quote} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-3 font-semibold">Notes</h3>
        <ul className="space-y-3 text-sm">
          {(notes ?? []).map((n) => (
            <li key={n.id} className="border-b border-slate-100 pb-2">
              <p>{n.note}</p>
              <p className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
          {(notes ?? []).length === 0 && <p className="text-slate-500">No notes yet.</p>}
        </ul>
      </div>
    </div>
  );
}
