"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SHOWCASE_FEATURES as FEATURES } from "@/components/marketing/showcase-data";

const SLIDE_MS = 3800;

// Stands in for the "60-second demo video" ask — a real edited video file
// isn't something this session can produce, so this autoplays through the
// actual product components instead: reads like a video (story-style
// segmented progress bar, captioned, looping) but never goes stale when the
// UI changes, and needs no separate recording/editing step.
export function HeroDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    function tick(now: number) {
      const pct = Math.min(100, ((now - start) / SLIDE_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setActive((i) => (i + 1) % FEATURES.length);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, playing]);

  const current = FEATURES[active];
  const Preview = current.Preview;

  return (
    <div className="relative mx-auto mt-14 max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent to-primary/5 shadow-popover">
        <div className="flex gap-1.5 p-3">
          {FEATURES.map((f, i) => (
            <div key={f.id} className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: i < active ? "100%" : i === active ? `${progress}%` : "0%", transitionDuration: i === active ? "0ms" : "300ms" }}
              />
            </div>
          ))}
        </div>

        <div className="relative flex aspect-video items-center justify-center px-8 pb-8 sm:px-14">
          <div key={current.id} className="w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500">
            <Preview />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause demo" : "Play demo"}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-card backdrop-blur hover:bg-background"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-0.5" />}
        </button>

        <div className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          {current.title}
        </div>
      </div>
    </div>
  );
}
