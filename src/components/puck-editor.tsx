"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig, RICH_DEFAULT_CONTENT, type PuckProps } from "@/lib/puck-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Send, PanelRightClose, PanelRightOpen, FileStack } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageLayout } from "@/types/database";

const DEFAULT_DATA: Data = { content: RICH_DEFAULT_CONTENT, root: {}, zones: {} } as Data;

type ChatEntry = { role: "user" | "assistant"; text: string };

export function PuckEditor({
  tenantSlug,
  faqItems,
  versions: initialVersions,
  activeVersionId,
}: {
  tenantSlug: string;
  faqItems: PuckProps["faqItems"];
  versions: PageLayout[];
  activeVersionId: string | null;
}) {
  const router = useRouter();
  const [versions, setVersions] = useState(initialVersions);
  const [activeId, setActiveId] = useState(activeVersionId);
  const [selectedId, setSelectedId] = useState<string | null>(activeVersionId ?? versions[0]?.id ?? null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [chat, setChat] = useState<ChatEntry[]>([
    { role: "assistant", text: "Tell me what you want your page to say — I'll build it from your live components. Try \"focus on long-distance moves, warm and reassuring tone\"." },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const selectedVersion = versions.find((v) => v.id === selectedId);
  const currentData: Data = (selectedVersion?.data as Data) ?? DEFAULT_DATA;

  async function save(data: Data) {
    const res = await fetch("/api/settings/page-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: selectedId, name: selectedVersion?.name ?? "Original", data, makeActive: true }),
    });
    const result = await res.json();
    if (result.versionId) {
      setActiveId(result.versionId);
      setSelectedId(result.versionId);
      if (!selectedVersion) setVersions((prev) => [{ id: result.versionId, tenant_id: "", name: "Original", data, slug: null, nav_label: null, is_published: false, created_at: new Date().toISOString() }, ...prev]);
    }
    router.refresh();
  }

  async function activate(versionId: string) {
    await fetch("/api/settings/page-layout/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId }) });
    setActiveId(versionId);
    router.refresh();
  }

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || generating) return;
    const userPrompt = prompt;
    setChat((prev) => [...prev, { role: "user", text: userPrompt }]);
    setPrompt("");
    setGenerating(true);
    const res = await fetch("/api/settings/generate-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    const result = await res.json();
    setGenerating(false);
    if (res.ok && result.version) {
      setVersions((prev) => [result.version, ...prev]);
      setSelectedId(result.version.id);
      setChat((prev) => [...prev, { role: "assistant", text: `Done — created "${result.version.name}". Reviewing it now on the canvas; hit "Set as live" if you like it, or ask me to try again.` }]);
    } else {
      setChat((prev) => [...prev, { role: "assistant", text: `Couldn't generate that: ${result.error ?? "something went wrong"}. Try rephrasing?` }]);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2">
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          {versions.length === 0 && <option value="">Default template (unsaved)</option>}
          {versions.map((v) => (
            <option key={v.id} value={v.id}>{v.name}{v.id === activeId ? " — Live" : ""}</option>
          ))}
        </select>
        {selectedId && selectedId !== activeId && (
          <Button size="sm" variant="outline" onClick={() => activate(selectedId)}>Set as live</Button>
        )}
        {selectedId === activeId && selectedId && <Badge variant="success">Live</Badge>}

        <Link href="/page-builder/pages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <FileStack className="h-4 w-4" /> Pages
        </Link>

        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setPanelOpen((v) => !v)}>
          {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          AI Assistant
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <Puck key={selectedId ?? "default"} config={puckConfig} data={currentData} metadata={{ tenantSlug, faqItems } satisfies PuckProps} onPublish={save} />
        </div>

        {panelOpen && (
          <div className="flex w-96 shrink-0 flex-col border-l border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">AI page assistant</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {chat.map((entry, i) => (
                <div key={i} className={cn("flex gap-2.5", entry.role === "user" && "flex-row-reverse")}>
                  <Avatar name={entry.role === "user" ? "You" : "AI"} className={entry.role === "assistant" ? "bg-primary" : undefined} />
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm",
                      entry.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {entry.text}
                  </div>
                </div>
              ))}
              {generating && (
                <div className="flex gap-2.5">
                  <Avatar name="AI" />
                  <div className="rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">Building your page…</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={generate} className="border-t border-border p-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) generate(e);
                }}
                placeholder="Describe the page you want..."
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Enter to send, Shift+Enter for a new line</span>
                <Button type="submit" size="sm" disabled={generating || !prompt.trim()}>
                  <Send className="h-3.5 w-3.5" /> {generating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
