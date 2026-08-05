"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillingCard({
  planSlug,
  planName,
  subscriptionStatus,
}: {
  planSlug: string;
  planName: string;
  subscriptionStatus: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInactive = planSlug !== "paid" || subscriptionStatus !== "active";

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
    <Card className={isInactive ? "border-danger/40 shadow-card" : "shadow-card"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Billing
          {isInactive && <Badge variant="secondary" className="border-danger/30 bg-danger/10 text-danger">Inactive</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Current plan: <strong className="text-foreground">{planName}</strong>
          {isInactive
            ? " — your subscription is inactive. Reactivate to regain dashboard access; your public quote funnel keeps working in the meantime."
            : " — £97/month, everything included."}
        </p>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        {isInactive ? (
          <Button disabled={loading} onClick={() => go("/api/stripe/checkout")}>
            {loading ? "Redirecting..." : "Reactivate — £97/mo"}
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
