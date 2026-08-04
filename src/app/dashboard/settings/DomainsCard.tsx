"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DomainsCard({
  slug,
  siteUrl,
  customDomain,
  customDomainStatus,
  isPro,
}: {
  slug: string;
  siteUrl: string;
  customDomain: string | null;
  customDomainStatus: string | null;
  isPro: boolean;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addDomain() {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/settings/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add that domain");
      return;
    }
    setDomain("");
    router.refresh();
  }

  async function checkStatus() {
    setLoading(true);
    await fetch("/api/settings/domain");
    setLoading(false);
    router.refresh();
  }

  async function removeDomain() {
    setLoading(true);
    await fetch("/api/settings/domain", { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Domains</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Your funnel is live at</p>
          <a href={`${siteUrl}/${slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
            {siteUrl.replace(/^https?:\/\//, "")}/{slug}
          </a>
          <p className="mt-1 text-xs text-muted-foreground">Subdomains like {slug}.yourdomain.com arrive once QuoteHaul is running on its own domain — this link keeps working either way.</p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium">Custom domain</p>
          {!isPro ? (
            <p className="text-sm text-muted-foreground">Upgrade to Pro to connect your own domain.</p>
          ) : customDomain ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span>{customDomain}</span>
                <Badge variant={customDomainStatus === "verified" ? "success" : "secondary"}>
                  {customDomainStatus === "verified" ? "Verified" : "Pending DNS"}
                </Badge>
              </div>
              {customDomainStatus !== "verified" && (
                <p className="text-xs text-muted-foreground">
                  Add a CNAME record for <code className="rounded bg-muted px-1">{customDomain}</code> pointing to <code className="rounded bg-muted px-1">cname.vercel-dns.com</code>, then check status.
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={checkStatus}>Check status</Button>
                <Button size="sm" variant="outline" disabled={loading} onClick={removeDomain}>Remove</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="www.yourcompany.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
              <Button disabled={loading} onClick={addDomain}>{loading ? "Adding..." : "Add domain"}</Button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
