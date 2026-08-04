"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Zap, Lock, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

const PROPERTY_SIZES = [
  { key: "studio", label: "Studio" },
  { key: "1_bed", label: "1 bedroom" },
  { key: "2_bed", label: "2 bedroom" },
  { key: "3_bed", label: "3 bedroom" },
  { key: "4_plus_bed", label: "4+ bedroom" },
  { key: "office", label: "Office" },
];

export default function QuoteForm({ tenantSlug }: { tenantSlug: string }) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ low: number; high: number; token: string; retrievalEnabled: boolean } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [fromPostcode, setFromPostcode] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [fromTown, setFromTown] = useState("");
  const [toTown, setToTown] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [propertySize, setPropertySize] = useState("2_bed");
  const [needsStairs, setNeedsStairs] = useState(false);
  const [needsPacking, setNeedsPacking] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  async function getEstimate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, fromPostcode, toPostcode, fromTown, toTown, moveDate, propertySize, needsStairs, needsPacking, stage: "estimate" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong getting your estimate.");
    setResult({ low: data.estimateLow, high: data.estimateHigh, token: data.token, retrievalEnabled: data.retrievalEnabled });
    setStep(4);
  }

  async function submitContactDetails() {
    if (!result) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, token: result.token, customerName, customerEmail, customerPhone, stage: "contact" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong submitting your details.");
    setStep(5);
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <Progress value={(Math.min(step, 4) / 4) * 100} className="mb-1" />
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <CardTitle>Where are you moving?</CardTitle>
            <div className="space-y-1.5">
              <Label>Moving from (postcode)</Label>
              <Input value={fromPostcode} onChange={(e) => setFromPostcode(e.target.value)} placeholder="e.g. BT1 1AA" />
            </div>
            <div className="space-y-1.5">
              <Label>Moving to (postcode)</Label>
              <Input value={toPostcode} onChange={(e) => setToPostcode(e.target.value)} placeholder="e.g. M1 1AE" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>From town (optional)</Label>
                <Input value={fromTown} onChange={(e) => setFromTown(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>To town (optional)</Label>
                <Input value={toTown} onChange={(e) => setToTown(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={!fromPostcode || !toPostcode} onClick={next}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <CardTitle>When are you moving?</CardTitle>
            <Input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button className="flex-1" onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <CardTitle>What size is your property?</CardTitle>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_SIZES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPropertySize(p.key)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    propertySize === p.key ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-accent"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={needsStairs} onChange={(e) => setNeedsStairs(e.target.checked)} className="accent-primary" />
              Stairs / no lift access
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={needsPacking} onChange={(e) => setNeedsPacking(e.target.checked)} className="accent-primary" />
              I&apos;d like a packing service
            </label>
            {error && <p className="text-sm text-destructive text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button className="flex-1" disabled={loading} onClick={getEstimate}>
                {loading ? "Calculating..." : "Get my estimate"}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
              <p className="text-sm text-muted-foreground">Your instant estimate (guide only)</p>
              <p className="mt-2 text-3xl font-bold">£{result.low} – £{result.high}</p>
              <p className="mt-2 text-xs text-muted-foreground">Confirmed by a real person before anything is booked.</p>
            </div>
            <CardTitle className="text-base">Get this estimate confirmed</CardTitle>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" size="lg" disabled={loading || !customerName || !customerEmail || !customerPhone} onClick={submitContactDetails}>
              {loading ? "Submitting..." : "Send me this estimate"}
            </Button>
            <ul className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Free & no obligation</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> The right local mover</li>
              <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant online estimate</li>
              <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Your details stay private</li>
            </ul>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 py-6 text-center">
            <CardTitle>Thanks — you&apos;re all set!</CardTitle>
            <CardDescription>
              A member of the team will confirm your exact price shortly. We&apos;ve emailed you a copy of your estimate.
            </CardDescription>
            {result?.retrievalEnabled && (
              <div className="mx-auto flex max-w-xs items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
                <Link href={`/${tenantSlug}/retrieve?token=${result.token}`} className="flex-1 truncate text-left font-medium text-primary hover:underline">
                  /{tenantSlug}/retrieve?token={result.token}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/${tenantSlug}/retrieve?token=${result.token}`);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground hover:bg-background"
                  aria-label="Copy link"
                >
                  {linkCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {linkCopied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
