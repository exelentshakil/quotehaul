"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, email, password, phone }),
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

    // Every account goes straight to Stripe Checkout — billing starts immediately.
    const checkoutRes = await fetch("/api/stripe/checkout", { method: "POST" });
    const checkoutData = await checkoutRes.json();
    if (checkoutRes.ok && checkoutData.url) {
      window.location.href = checkoutData.url;
      return;
    }
    setError(checkoutData.error ?? "Could not start your subscription. Please try again.");
    setLoading(false);
  }

  return (
    <>
    <SiteHeader />
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Card className="shadow-popover">
        <CardHeader>
          <CardTitle className="text-2xl">Start your subscription</CardTitle>
          <p className="text-sm text-muted-foreground">Full access to QuoteHaul Pro — £97/month, cancel any time.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone (shown to customers)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button disabled={loading} type="submit" className="w-full">
              {loading ? "Setting up your account..." : "Continue to payment details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
    <SiteFooter />
    </>
  );
}
