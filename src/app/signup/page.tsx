"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialPlan = params.get("plan") === "paid" ? "paid" : "free";

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [planSlug, setPlanSlug] = useState<"free" | "paid">(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, email, password, phone, planSlug }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.wantsPaid) {
      const checkoutRes = await fetch("/api/stripe/checkout", { method: "POST" });
      const checkoutData = await checkoutRes.json();
      if (checkoutRes.ok && checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-bold">Set up your account</h1>
      <p className="mb-8 text-sm text-slate-600">14-day free trial on the Paid plan, or start on Free — no card required either way.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Company name</label>
          <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Work email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone (shown to customers)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Plan</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setPlanSlug("free")} className={`flex-1 rounded-md border px-3 py-2 text-sm ${planSlug === "free" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>Free</button>
            <button type="button" onClick={() => setPlanSlug("paid")} className={`flex-1 rounded-md border px-3 py-2 text-sm ${planSlug === "paid" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>Paid — £97/mo</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={loading} type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
