"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, CalendarClock, Settings, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Leads", icon: KanbanSquare },
  { href: "/dashboard/capacity", label: "Capacity", icon: CalendarClock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ tenantSlug }: { tenantSlug?: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {LINKS.map((link) => {
        const active = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
              active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" /> {link.label}
          </Link>
        );
      })}
      {tenantSlug && (
        <a
          href={`/${tenantSlug}`}
          target="_blank"
          rel="noreferrer"
          className="ml-1 flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" /> Public funnel
        </a>
      )}
    </nav>
  );
}
