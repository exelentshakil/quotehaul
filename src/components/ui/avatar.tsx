import { cn } from "@/lib/utils";

const COLORS = ["bg-primary", "bg-success", "bg-warning", "bg-danger"];

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        colorFor(name || "?"),
        className
      )}
    >
      {initials}
    </span>
  );
}
