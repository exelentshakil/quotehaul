"use client";

import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { puckConfig } from "@/lib/puck-config";

const DEFAULT_DATA: Data = {
  content: [
    { type: "Hero", props: { id: "hero-1", heading: "Moving house? Get an instant estimate.", subheading: "Free and no obligation — a real person confirms every quote.", ctaLabel: "Get my estimate" } },
    { type: "TrustBadges", props: { id: "badges-1", items: "Free & no obligation, Instant online estimate, Your details stay private" } },
  ],
  root: {},
};

export function PuckEditor({ tenantSlug, initialData }: { tenantSlug: string; initialData: Data | null }) {
  const router = useRouter();

  async function save(data: Data) {
    await fetch("/api/settings/page-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    router.refresh();
  }

  return (
    <div className="h-screen">
      <Puck config={puckConfig} data={initialData ?? DEFAULT_DATA} metadata={{ tenantSlug }} onPublish={save} />
    </div>
  );
}
