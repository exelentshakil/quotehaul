"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RequestPaymentPanel({ quoteId, defaultAmount }: { quoteId: string; defaultAmount: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState(defaultAmount);
  const [label, setLabel] = useState("Deposit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/leads/${quoteId}/request-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, label }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not create the payment link");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Request payment</CardTitle>
        <p className="text-sm text-muted-foreground">Sends a secure Stripe payment link into the order thread — a deposit or the final balance, whenever you're ready.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1" placeholder="Deposit" />
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-28" />
          <Button disabled={loading} onClick={send}>{loading ? "Sending..." : "Send link"}</Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </CardContent>
    </Card>
  );
}
