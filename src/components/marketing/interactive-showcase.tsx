"use client";

import { useEffect, useRef, useState } from "react";
import { SHOWCASE_FEATURES as FEATURES } from "@/components/marketing/showcase-data";

const SLIDE_MS = 4500;

// Autoplays like a product demo video (each tab gets a filling progress
// bar, then advances) but is fully click-driven too — picking a tab
// directly pauses autoplay so exploring never fights the timer.
export function InteractiveShowcase() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoplay) return;
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
  }, [active, autoplay]);

  function selectTab(i: number) {
    setAutoplay(false);
    setProgress(0);
    setActive(i);
  }

  const current = FEATURES[active];
  const Preview = current.Preview;

  return (
    <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">See it in action</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Every feature, one click away</h2>
          <p className="mt-3 text-muted-foreground">No sign-up needed — click through the real product below.</p>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {FEATURES.map((f, i) => (
              <button
                key={f.id}
                onClick={() => selectTab(i)}
                className={`relative shrink-0 overflow-hidden rounded-lg border px-4 py-3 text-left text-sm transition-colors lg:w-full ${
                  i === active ? "border-primary bg-card shadow-card" : "border-border bg-transparent hover:bg-card/60"
                }`}
              >
                {i === active && autoplay && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/20">
                    <span className="block h-full bg-primary" style={{ width: `${progress}%` }} />
                  </span>
                )}
                <span className={`font-medium whitespace-nowrap ${i === active ? "text-foreground" : "text-muted-foreground"}`}>{f.label}</span>
              </button>
            ))}
          </div>

          <div key={current.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <h3 className="text-xl font-semibold">{current.title}</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">{current.body}</p>
            <div className="mt-5 max-w-md">
              <Preview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
