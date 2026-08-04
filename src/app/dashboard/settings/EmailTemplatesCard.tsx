"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_TEMPLATE_TYPES } from "@/lib/email-templates";
import type { EmailTemplateOverride, EmailTemplateType } from "@/types/database";

export default function EmailTemplatesCard({ initialTemplates }: { initialTemplates: Partial<Record<EmailTemplateType, EmailTemplateOverride>> }) {
  const [activeType, setActiveType] = useState<EmailTemplateType>("new_lead");
  const [drafts, setDrafts] = useState(initialTemplates);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const meta = EMAIL_TEMPLATE_TYPES.find((t) => t.type === activeType)!;
  const draft = drafts[activeType];
  const subject = draft?.subject ?? "";
  const body = draft?.body ?? "";
  const isCustomized = Boolean(draft);

  function updateDraft(patch: Partial<EmailTemplateOverride>) {
    setSaved(false);
    setDrafts((prev) => ({ ...prev, [activeType]: { subject: prev[activeType]?.subject ?? "", body: prev[activeType]?.body ?? "", ...patch } }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/email-templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeType, subject, body }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  async function resetToDefault() {
    setSaving(true);
    await fetch("/api/settings/email-templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeType, reset: true }),
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[activeType];
      return next;
    });
    setSaving(false);
    setSaved(false);
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Email templates</CardTitle>
        <p className="text-sm text-muted-foreground">Customize the wording of each transactional email — leave blank to use QuoteHaul's default.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {EMAIL_TEMPLATE_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setActiveType(t.type)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeType === t.type ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}{drafts[t.type] ? " •" : ""}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{meta.description}</p>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subject</Label>
          <Input value={subject} onChange={(e) => updateDraft({ subject: e.target.value })} placeholder="Default subject used if left blank" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Body</Label>
          <textarea
            value={body}
            onChange={(e) => updateDraft({ body: e.target.value })}
            placeholder="Default wording used if left blank"
            rows={5}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">Available tokens: {meta.tokens.map((t) => `{{${t}}}`).join(", ")}</p>

        <div className="flex items-center gap-3">
          <Button size="sm" disabled={saving || !subject.trim() || !body.trim()} onClick={save}>{saving ? "Saving..." : "Save template"}</Button>
          {isCustomized && (
            <Button size="sm" variant="ghost" disabled={saving} onClick={resetToDefault}>Reset to default</Button>
          )}
          {saved && <span className="text-sm text-success">Saved.</span>}
        </div>
      </CardContent>
    </Card>
  );
}
