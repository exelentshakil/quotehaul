"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig, RICH_DEFAULT_CONTENT, type PuckProps } from "@/lib/puck-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { PageLayout } from "@/types/database";

const DEFAULT_DATA: Data = { content: RICH_DEFAULT_CONTENT, root: {}, zones: {} } as Data;

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
      if (!selectedVersion) setVersions((prev) => [{ id: result.versionId, tenant_id: "", name: "Original", data, created_at: new Date().toISOString() }, ...prev]);
    }
    router.refresh();
  }

  async function activate(versionId: string) {
    await fetch("/api/settings/page-layout/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId }) });
    setActiveId(versionId);
    router.refresh();
  }

  async function generate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/settings/generate-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const result = await res.json();
    setGenerating(false);
    if (res.ok && result.version) {
      setVersions((prev) => [result.version, ...prev]);
      setSelectedId(result.version.id);
      setPrompt("");
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

        <div className="ml-auto flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the page you want (AI generates a new version)..."
            className="w-72 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
          <Button size="sm" disabled={generating || !prompt.trim()} onClick={generate}>
            <Sparkles className="h-3.5 w-3.5" /> {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Puck key={selectedId ?? "default"} config={puckConfig} data={currentData} metadata={{ tenantSlug, faqItems } satisfies PuckProps} onPublish={save} />
      </div>
    </div>
  );
}
