"use client";

import * as React from "react";
import Link from "next/link";
import { Truck, LayoutDashboard, KanbanSquare, CalendarClock, Settings, ExternalLink, Users, Receipt, UserCog } from "lucide-react";
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { canAccess, type Membership } from "@/lib/permissions";

const NAV_ITEMS: (NavMainItem & { permKey: Parameters<typeof canAccess>[1] })[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permKey: "overview" },
  { title: "Leads", url: "/dashboard/leads", icon: KanbanSquare, permKey: "leads" },
  { title: "Customers", url: "/dashboard/customers", icon: Users, permKey: "customers" },
  { title: "Invoices", url: "/dashboard/invoices", icon: Receipt, permKey: "invoices" },
  { title: "Capacity", url: "/dashboard/capacity", icon: CalendarClock, permKey: "capacity" },
  { title: "Team", url: "/dashboard/team", icon: UserCog, permKey: "team" },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, permKey: "settings" },
];

export function AppSidebar({
  companyName,
  userEmail,
  tenantSlug,
  newLeadsCount = 0,
  avatarUrl,
  membership,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companyName: string;
  userEmail: string;
  tenantSlug?: string;
  newLeadsCount?: number;
  avatarUrl?: string | null;
  membership: Membership | null;
}) {
  const visible = NAV_ITEMS.filter((item) => canAccess(membership, item.permKey));
  const withBadges = visible.map((item) => (item.title === "Leads" ? { ...item, badge: newLeadsCount } : item));
  const items = tenantSlug
    ? [...withBadges, { title: "Public funnel", url: `/${tenantSlug}`, icon: ExternalLink, external: true }]
    : withBadges;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="cursor-default hover:bg-transparent">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-display truncate font-semibold">QuoteHaul</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{companyName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser companyName={companyName} userEmail={userEmail} tenantSlug={tenantSlug} avatarUrl={avatarUrl} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
