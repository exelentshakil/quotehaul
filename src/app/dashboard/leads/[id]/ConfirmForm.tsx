"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Quote } from "@/types/database";

export default function ConfirmForm({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [price, setPrice] = useState(quote.confirmed_price ?? quote.estimate_high ?? 0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/leads/${quote.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedPrice: price }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not confirm this quote");
      return;
    }
    router.refresh();
  }

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/leads/${quote.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function addNote() {
    if (!note.trim()) return;
    setLoading(true);
    await fetch(`/api/leads/${quote.id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-3 font-semibold">Confirm exact price</h3>
        <p className="mb-3 text-sm text-slate-500">
          System estimate: £{quote.estimate_low}–£{quote.estimate_high}. Review against real capacity/rates and confirm the exact price the customer will be sent.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-40 rounded-md border border-slate-300 px-3 py-2"
          />
          <button disabled={loading} onClick={confirm} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
            {quote.confirmed_price ? "Update & resend" : "Confirm & send to customer"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-3 font-semibold">Pipeline status</h3>
        <div className="flex flex-wrap gap-2">
          {["new", "pending_confirmation", "confirmed", "sent", "booked", "lost"].map((s) => (
            <button
              key={s}
              disabled={loading}
              onClick={() => updateStatus(s)}
              className={`rounded-full border px-3 py-1 text-sm ${quote.status === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-3 font-semibold">Add a note</h3>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" rows={3} />
        <button disabled={loading} onClick={addNote} className="mt-2 rounded-md border border-slate-300 px-4 py-2 text-sm">
          Add note
        </button>
      </div>
    </div>
  );
}
