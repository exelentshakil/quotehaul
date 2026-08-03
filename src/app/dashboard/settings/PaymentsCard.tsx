"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentsCard({ status }: { status: string | null }) {
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.url) window.location.href = data.url;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Payments</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect Stripe to request deposits or final balances from customers on confirmed orders. Money goes straight to your own account — QuoteHaul never holds it.
        </p>
      </CardHeader>
      <CardContent>
        {status === "verified" ? (
          <p className="text-sm font-medium text-success">Connected and ready to accept payments.</p>
        ) : (
          <>
            {status === "pending" && <p className="mb-2 text-sm text-warning">Onboarding started but not finished yet.</p>}
            <Button disabled={loading} onClick={connect}>{loading ? "Redirecting..." : status === "pending" ? "Finish Stripe setup" : "Connect Stripe"}</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
