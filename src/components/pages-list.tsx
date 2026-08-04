"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { PageLayout } from "@/types/database";

export function PagesList({ tenantSlug, pages: initialPages }: { tenantSlug: string; pages: PageLayout[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    const res = await fetch("/api/settings/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create that page");
      return;
    }
    setPages((prev) => [data.page, ...prev]);
    setName("");
    setPrompt("");
    router.refresh();
  }

  async function togglePublish(page: PageLayout) {
    await fetch(`/api/settings/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.is_published }),
    });
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p)));
  }

  async function remove(id: string) {
    await fetch(`/api/settings/pages/${id}`, { method: "DELETE" });
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">New page</CardTitle>
          <p className="text-sm text-muted-foreground">e.g. "About", "Services", "Contact" — optionally describe it and AI drafts the content.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Page name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Describe the page (optional — AI generates it)" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button disabled={creating || !name.trim()} onClick={create}>
            {prompt.trim() && <Sparkles className="h-3.5 w-3.5" />} {creating ? "Creating..." : "Create page"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {pages.length === 0 && <p className="text-sm text-muted-foreground">No additional pages yet.</p>}
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">/{tenantSlug}/p/{p.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.is_published ? "success" : "secondary"}>{p.is_published ? "Published" : "Draft"}</Badge>
              <Link href={`/page-builder/pages/${p.id}`} className="text-sm text-primary hover:underline">Edit</Link>
              <button onClick={() => togglePublish(p)} className="text-sm text-muted-foreground hover:text-foreground">{p.is_published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => remove(p.id)} className="text-sm text-muted-foreground hover:text-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
