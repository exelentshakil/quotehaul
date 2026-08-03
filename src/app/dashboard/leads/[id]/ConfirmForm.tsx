"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Quote, QuoteStatus } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const STATUSES: QuoteStatus[] = ["new", "pending_confirmation", "confirmed", "sent", "booked", "lost"];

export default function ConfirmForm({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [price, setPrice] = useState(quote.confirmed_price ?? quote.estimate_high ?? 0);
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

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Confirm exact price</CardTitle>
          <p className="text-sm text-muted-foreground">
            System estimate: £{quote.estimate_low}–£{quote.estimate_high}. Review against real capacity/rates and confirm the exact price the customer will be sent.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-40" />
            <Button disabled={loading} onClick={confirm}>
              {quote.confirmed_price ? "Update & resend" : "Confirm & send to customer"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Pipeline status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => updateStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  quote.status === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
