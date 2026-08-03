"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CapacityResource } from "@/types/database";
import type { DayStatus } from "@/lib/capacity";

const STATUS_STYLE: Record<DayStatus, string> = {
  open: "bg-success/10 text-success",
  near_capacity: "bg-warning/10 text-warning",
  full: "bg-danger/10 text-danger",
  blocked: "bg-muted text-muted-foreground",
  forced_open: "bg-primary/10 text-primary",
};

const STATUS_LABEL: Record<DayStatus, string> = {
  open: "Open", near_capacity: "Near capacity", full: "Full", blocked: "Blocked", forced_open: "Forced open",
};

type Day = { date: string; bookedHours: number; jobCount: number; status: DayStatus; override: boolean | null };

export function CapacityManager({
  resources,
  totalCapacityHours,
  days,
}: {
  resources: CapacityResource[];
  totalCapacityHours: number;
  days: Day[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hours, setHours] = useState(8);
  const [loading, setLoading] = useState(false);

  async function addResource() {
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/capacity/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, crewHoursPerDay: hours }),
    });
    setName("");
    setLoading(false);
    router.refresh();
  }

  async function removeResource(id: string) {
    await fetch("/api/capacity/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  async function setOverride(date: string, isOpen: boolean | null) {
    await fetch("/api/capacity/blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, isOpen }) });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Resources</CardTitle>
          <p className="text-sm text-muted-foreground">Define your crews/vans and daily hours. Total capacity: {totalCapacityHours}h/day.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <span>{r.name} — {r.crew_hours_per_day}h/day</span>
              <button onClick={() => removeResource(r.id)} className="text-xs text-muted-foreground hover:text-danger">Remove</button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="e.g. Crew A / Van 1" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" className="w-24" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            <Button disabled={loading} onClick={addResource}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Next 14 days</CardTitle>
          <p className="text-sm text-muted-foreground">Computed from confirmed/booked jobs. A manual block or force-open always wins over the computed status.</p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {days.map((d) => (
            <div key={d.date} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-28 font-medium">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[d.status])}>{STATUS_LABEL[d.status]}</span>
                <span className="text-xs text-muted-foreground">{d.jobCount} job{d.jobCount === 1 ? "" : "s"}, {d.bookedHours}h booked</span>
              </div>
              <div className="flex gap-2 text-xs">
                {d.override !== false && <button onClick={() => setOverride(d.date, false)} className="text-muted-foreground hover:text-danger">Block</button>}
                {d.override !== true && <button onClick={() => setOverride(d.date, true)} className="text-muted-foreground hover:text-primary">Force open</button>}
                {d.override !== null && <button onClick={() => setOverride(d.date, null)} className="text-muted-foreground hover:text-foreground">Clear</button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
