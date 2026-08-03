"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

export function ChatWidget({ tenantSlug, companyName }: { tenantSlug: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: `Hi! Ask me anything about moving with ${companyName}.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next: Msg[] = [...messages, { role: "user", text: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/public/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, message: input, history: next }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setMessages((prev) => [...prev, { role: "assistant", text: data.reply || "Sorry, something went wrong — please try again." }]);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-popover hover:opacity-90"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-popover">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">{companyName}</span>
        <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
            {m.text}
          </div>
        ))}
        {loading && <div className="max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">Typing...</div>}
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a question..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button size="icon" disabled={loading} onClick={send}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
