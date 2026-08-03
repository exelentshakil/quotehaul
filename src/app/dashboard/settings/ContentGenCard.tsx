"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function ContentGenCard({ existingAdCopy }: { existingAdCopy: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adCopy, setAdCopy] = useState(existingAdCopy);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/settings/generate-content", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setAdCopy(data.adCopy);
      router.refresh();
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> AI content</CardTitle>
        <p className="text-sm text-muted-foreground">Draft your FAQ, moving-day checklist page, and starter Facebook/Google ad copy from your company details in one click.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button disabled={loading} onClick={generate}>{loading ? "Writing..." : existingAdCopy ? "Regenerate" : "Generate with AI"}</Button>
        {adCopy && <div className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">{adCopy}</div>}
      </CardContent>
    </Card>
  );
}
