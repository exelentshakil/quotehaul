"use client";

import { useState, useTransition } from "react";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { KanbanCard } from "@/components/ui/kanban-card";
import { STATUS_LABELS } from "@/components/ui/status-badge";
import type { Quote, QuoteStatus } from "@/types/database";

const COLUMNS: QuoteStatus[] = ["new", "pending_confirmation", "confirmed", "sent", "booked", "lost"];

function DraggableCard({ quote }: { quote: Quote }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: quote.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="touch-none">
      <KanbanCard quote={quote} dragging={isDragging} />
    </div>
  );
}

function Column({ status, quotes }: { status: QuoteStatus; quotes: Quote[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/40 p-3 transition-colors ${isOver ? "bg-accent" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-semibold">{STATUS_LABELS[status]}</p>
        <span className="text-xs text-muted-foreground">{quotes.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {quotes.map((q) => <DraggableCard key={q.id} quote={q} />)}
      </div>
    </div>
  );
}

export function KanbanBoard({ quotes }: { quotes: Quote[] }) {
  const [items, setItems] = useState(quotes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as QuoteStatus;
    const quote = items.find((q) => q.id === active.id);
    if (!quote || quote.status === newStatus) return;

    setItems((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: newStatus } : q)));
    startTransition(() => {
      fetch(`/api/leads/${quote.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {
        // Revert on failure
        setItems((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: quote.status } : q)));
      });
    });
  }

  const activeQuote = items.find((q) => q.id === activeId);

  // Without an activation distance, dnd-kit treats any pointerdown+micro-move
  // as a drag start and swallows the click — breaking the card's Link
  // navigation until several attempts happen to land with zero movement.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <Column key={status} status={status} quotes={items.filter((q) => q.status === status)} />
        ))}
      </div>
      <DragOverlay>{activeQuote && <KanbanCard quote={activeQuote} />}</DragOverlay>
    </DndContext>
  );
}
