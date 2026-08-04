"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useRouter } from "next/navigation";
import { puckConfig, puckOverrides, PUCK_VIEWPORTS, type PuckProps } from "@/lib/puck-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SecondaryPageEditor({
  pageId,
  pageSlug,
  tenantSlug,
  faqItems,
  data,
  initialIsPublished,
}: {
  pageId: string;
  pageSlug: string | null;
  tenantSlug: string;
  faqItems: PuckProps["faqItems"];
  data: Data;
  initialIsPublished: boolean;
}) {
  const router = useRouter();
  const [lastSaved, setLastSaved] = useState(data);
  const [current, setCurrent] = useState(data);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [publishing, setPublishing] = useState(false);
  const isDirty = JSON.stringify(current) !== JSON.stringify(lastSaved);

  async function save(newData: Data) {
    await fetch(`/api/settings/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newData }),
    });
    setLastSaved(newData);
    router.refresh();
  }

  async function togglePublished() {
    setPublishing(true);
    const next = !isPublished;
    await fetch(`/api/settings/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    setIsPublished(next);
    setPublishing(false);
    router.refresh();
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2">
        <Link href="/page-builder/pages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Pages
        </Link>
        <div className="h-5 w-px bg-border" />
        {isPublished && pageSlug && (
          <Button size="sm" variant="ghost" asChild>
            <a href={`/${tenantSlug}/p/${pageSlug}`} target="_blank" rel="noreferrer">
              <Eye className="h-3.5 w-3.5" /> Preview
            </a>
          </Button>
        )}
        {isDirty ? (
          <Badge variant="secondary">Unsaved changes</Badge>
        ) : isPublished ? (
          <Badge variant="success">Live</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        )}
        <Button size="sm" variant="outline" className="ml-auto" disabled={publishing} onClick={togglePublished}>
          {publishing ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div>
      <div className="flex-1">
        <Puck
          config={puckConfig}
          data={data}
          metadata={{ tenantSlug, faqItems } satisfies PuckProps}
          onChange={setCurrent}
          onPublish={save}
          viewports={PUCK_VIEWPORTS}
          overrides={puckOverrides}
        />
      </div>
    </div>
  );
}
