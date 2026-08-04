"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LABEL_OPTIONS = ["Deposit", "Balance", "Full amount"];

// Creates a real branded invoice (logo, itemized amount, printable/PDF via
// the browser) and posts a link to it into the existing order-message
// thread — the mover takes payment however they already do (bank transfer,
// cash, their own card reader) once the job itself is confirmed, QuoteHaul
// never processes the payment itself.
export function SendInvoicePanel({ quoteId, defaultAmount }: { quoteId: string; defaultAmount: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState(defaultAmount);
  const [label, setLabel] = useState(LABEL_OPTIONS[0]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/leads/${quoteId}/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, label, instructions: instructions.trim() || null }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(data?.error ?? "Could not send the invoice");
      return;
    }
    setInvoiceUrl(data.invoiceUrl);
    router.refresh();
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Send invoice</CardTitle>
        <p className="text-sm text-muted-foreground">Creates a branded invoice and sends the link into the order thread — the customer gets it by email, and pays however you already collect payment.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <select value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-md border border-input bg-background px-2 text-sm">
            {LABEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-28" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Payment instructions (optional)</Label>
          <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. bank transfer to XX-XX-XX, 12345678" />
        </div>
        <Button disabled={loading} onClick={send} className="w-full">{loading ? "Sending..." : "Send invoice"}</Button>
        {error && <p className="text-sm text-danger">{error}</p>}
        {invoiceUrl && !error && (
          <p className="text-sm text-success">
            Sent — <a href={invoiceUrl} target="_blank" rel="noreferrer" className="underline">view the invoice</a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
