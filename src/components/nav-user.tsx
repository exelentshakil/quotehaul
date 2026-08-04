"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronsUpDown, Settings, ExternalLink, LogOut, Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function NavUser({ companyName, userEmail, tenantSlug, avatarUrl: initialAvatarUrl }: { companyName: string; userEmail: string; tenantSlug?: string; avatarUrl?: string | null }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "avatar");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && data.url) {
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { avatar_url: data.url } });
      setAvatarUrl(data.url);
      router.refresh();
    }
    setUploading(false);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar name={userEmail || companyName} src={avatarUrl} className="h-8 w-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{companyName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  aria-label="Change profile photo"
                >
                  <Avatar name={userEmail || companyName} src={avatarUrl} className="h-8 w-8" />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> : <Camera className="h-3.5 w-3.5 text-white" />}
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarFile(file);
                    e.target.value = "";
                  }}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{companyName}</span>
                  <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><Settings /> Settings</Link>
              </DropdownMenuItem>
              {tenantSlug && (
                <DropdownMenuItem asChild>
                  <a href={`/${tenantSlug}`} target="_blank" rel="noreferrer"><ExternalLink /> Public funnel</a>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/api/logout" method="post" className="w-full">
                <button type="submit" className="flex w-full items-center gap-2"><LogOut /> Log out</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
