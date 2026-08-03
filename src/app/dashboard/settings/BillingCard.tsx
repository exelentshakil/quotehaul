"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function daysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function BillingCard({
  planSlug,
  planName,
  subscriptionStatus,
  trialEndsAt,
}: {
  planSlug: string;
  planName: string;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTrialing = subscriptionStatus === "trialing";
  const remaining = isTrialing ? daysLeft(trialEndsAt) : null;

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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Billing
          {isTrialing && <Badge variant="secondary">Trial · {remaining ?? 0} day{remaining === 1 ? "" : "s"} left</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Current plan: <strong className="text-foreground">{planName}</strong>
          {planSlug === "free" && !isTrialing && " — capped at 20 leads/month, QuoteHaul branding shown, AI/domain/payments locked."}
          {isTrialing && " — you have full Pro access. Your card is charged automatically when the trial ends unless you cancel."}
        </p>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        {planSlug === "free" && !isTrialing ? (
          <Button disabled={loading} onClick={() => go("/api/stripe/checkout")}>
            {loading ? "Redirecting..." : "Upgrade to Pro — £97/mo"}
          </Button>
        ) : (
          <Button variant="outline" disabled={loading} onClick={() => go("/api/stripe/portal")}>
            {loading ? "Redirecting..." : "Manage billing"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
