"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RateConfig, Tenant } from "@/types/database";

export default function SettingsForm({ tenant, rateConfig }: { tenant: Tenant; rateConfig: RateConfig }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(tenant.company_name);
  const [phone, setPhone] = useState(tenant.branding?.phone ?? "");
  const [primaryColor, setPrimaryColor] = useState(tenant.branding?.primary_color ?? "#1d4ed8");
  const [ratePerMile, setRatePerMile] = useState(rateConfig.rate_per_mile);
  const [minimumJobPrice, setMinimumJobPrice] = useState(rateConfig.minimum_job_price);
  const [serviceRadius, setServiceRadius] = useState(rateConfig.service_radius_miles);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName, phone, primaryColor, ratePerMile, minimumJobPrice, serviceRadius,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Branding</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Company name</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone (shown to customers)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand color</label>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-20 rounded-md border border-slate-300" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Rate per mile (£)</label>
            <input type="number" step="0.1" value={ratePerMile} onChange={(e) => setRatePerMile(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Minimum job price (£)</label>
            <input type="number" value={minimumJobPrice} onChange={(e) => setMinimumJobPrice(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Service radius (mi)</label>
            <input type="number" value={serviceRadius} onChange={(e) => setServiceRadius(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Per-room base rates and surcharges use sensible defaults on signup — editing those in detail is coming soon; ping support to adjust them sooner.</p>
      </div>

      <button disabled={saving} onClick={save} className="rounded-md bg-slate-900 px-6 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save changes"}
      </button>
      {saved && <span className="ml-3 text-sm text-green-600">Saved.</span>}
    </div>
  );
}
