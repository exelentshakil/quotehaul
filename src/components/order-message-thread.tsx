"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Button } from "@/components/ui/button";
import type { OrderMessage } from "@/types/database";

export function OrderMessageThread({
  messages,
  endpoint,
  placeholder = "Write a message...",
}: {
  messages: OrderMessage[];
  endpoint: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not send that message");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="max-h-96 divide-y divide-border overflow-y-auto px-5">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            authorName={m.author_name || (m.author_type === "customer" ? "Customer" : "Team")}
            authorType={m.author_type}
            body={m.body}
            attachments={m.attachments}
            createdAt={m.created_at}
          />
        ))}
      </div>
      <div className="border-t border-border p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-2 flex justify-end">
          <Button size="sm" disabled={loading || !body.trim()} onClick={send}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
