"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { puckConfig, type PuckProps } from "@/lib/puck-config";

export function SecondaryPageEditor({ pageId, tenantSlug, faqItems, data }: { pageId: string; tenantSlug: string; faqItems: PuckProps["faqItems"]; data: Data }) {
  const router = useRouter();

  async function save(newData: Data) {
    await fetch(`/api/settings/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newData }),
    });
    router.refresh();
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2">
        <Link href="/page-builder/pages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Pages
        </Link>
      </div>
      <div className="flex-1">
        <Puck config={puckConfig} data={data} metadata={{ tenantSlug, faqItems } satisfies PuckProps} onPublish={save} />
      </div>
    </div>
  );
}
