"use client";

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
    <div className="h-screen">
      <Puck config={puckConfig} data={data} metadata={{ tenantSlug, faqItems } satisfies PuckProps} onPublish={save} />
    </div>
  );
}
