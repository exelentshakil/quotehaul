"use client";

import { useState } from "react";

export default function BillingCard({ planSlug, planName }: { planSlug: string; planName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(endpoint: "/api/stripe/checkout" | "/api/stripe/portal") {
    setLoading(true);
    setError(null);
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-1 font-semibold">Billing</h3>
      <p className="mb-4 text-sm text-slate-500">
        Current plan: <strong>{planName}</strong>
        {planSlug === "free" && " — Free tier is capped at 20 leads/month with email-only notifications."}
      </p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {planSlug === "free" ? (
        <button disabled={loading} onClick={() => go("/api/stripe/checkout")} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {loading ? "Redirecting..." : "Upgrade to Paid — £97/mo"}
        </button>
      ) : (
        <button disabled={loading} onClick={() => go("/api/stripe/portal")} className="rounded-md border border-slate-300 px-4 py-2 disabled:opacity-50">
          {loading ? "Redirecting..." : "Manage billing"}
        </button>
      )}
    </div>
  );
}
