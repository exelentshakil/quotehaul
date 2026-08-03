"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadScore } from "@/types/database";

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

export function LeadScorePanel({ quoteId, initial }: { quoteId: string; initial: LeadScore | null }) {
  const router = useRouter();
  const [score, setScore] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch(`/api/leads/${quoteId}/score`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setScore({
        quote_id: quoteId,
        tenant_id: "",
        score: data.score,
        factors: data.factors,
        follow_up_draft: data.followUpDraft,
        generated_at: new Date().toISOString(),
      });
    }
  }

  async function sendFollowUp() {
    if (!score?.follow_up_draft) return;
    setSending(true);
    await fetch(`/api/leads/${quoteId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: score.follow_up_draft }),
    });
    setSending(false);
    router.refresh();
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> AI lead score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {score ? (
          <>
            <p className={cn("text-3xl font-bold", scoreColor(score.score))}>{score.score}<span className="text-base font-normal text-muted-foreground">/100</span></p>
            {score.follow_up_draft && (
              <div className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">{score.follow_up_draft}</div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={loading} onClick={generate}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              {score.follow_up_draft && (
                <Button size="sm" disabled={sending} onClick={sendFollowUp}>
                  {sending ? "Sending..." : "Send this follow-up"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <Button size="sm" disabled={loading} onClick={generate}>
            {loading ? "Scoring..." : "Score this lead"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
