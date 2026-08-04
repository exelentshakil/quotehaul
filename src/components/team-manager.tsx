"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { PERMISSION_SECTIONS, type Permissions } from "@/lib/permissions";

export type TeamMember = {
  userId: string;
  email: string;
  avatarUrl: string | null;
  role: "owner" | "staff";
  permissions: Permissions;
};

const SECTION_LABELS: Record<(typeof PERMISSION_SECTIONS)[number], string> = {
  overview: "Overview",
  leads: "Leads",
  capacity: "Capacity",
  customers: "Customers",
  invoices: "Invoices",
  settings: "Settings",
  team: "Team",
};

export function TeamManager({ members, isOwner, currentUserId }: { members: TeamMember[]; isOwner: boolean; currentUserId: string }) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  async function invite() {
    setInviting(true);
    setInviteError(null);
    setInviteSent(false);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    });
    const data = await res.json().catch(() => null);
    setInviting(false);
    if (!res.ok) {
      setInviteError(data?.error ?? "Could not send the invite");
      return;
    }
    setInviteEmail("");
    setInviteSent(true);
    router.refresh();
  }

  async function togglePermission(member: TeamMember, section: keyof Permissions) {
    setBusyUserId(member.userId);
    const nextPermissions = { ...member.permissions, [section]: !member.permissions[section] };
    await fetch(`/api/team/${member.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: nextPermissions }),
    });
    setBusyUserId(null);
    router.refresh();
  }

  async function removeMember(member: TeamMember) {
    if (!confirm(`Remove ${member.email} from your team? They'll lose access to the dashboard.`)) return;
    setBusyUserId(member.userId);
    await fetch(`/api/team/${member.userId}`, { method: "DELETE" });
    setBusyUserId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Invite a team member</CardTitle>
            <p className="text-sm text-muted-foreground">They'll get an email to set their password, then sign in with the access you choose below.</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <Button onClick={invite} disabled={inviting || !inviteEmail.trim()}>{inviting ? "Sending..." : "Invite"}</Button>
            </div>
            {inviteError && <p className="mt-2 text-sm text-danger">{inviteError}</p>}
            {inviteSent && !inviteError && <p className="mt-2 text-sm text-success">Invite sent.</p>}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <div className="border-b border-border p-5">
          <h2 className="text-sm font-semibold">Members</h2>
        </div>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.userId} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.email} src={m.avatarUrl} className="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.email}{m.userId === currentUserId ? " (you)" : ""}</p>
                    <p className="text-xs text-muted-foreground">{m.role === "owner" ? "Owner — full access" : "Staff"}</p>
                  </div>
                </div>
                {isOwner && m.role === "staff" && (
                  <Button variant="ghost" size="sm" disabled={busyUserId === m.userId} onClick={() => removeMember(m)} className="text-danger hover:text-danger">
                    Remove
                  </Button>
                )}
              </div>

              {isOwner && m.role === "staff" && (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {PERMISSION_SECTIONS.map((section) => (
                    <label key={section} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={m.permissions[section]}
                        disabled={busyUserId === m.userId}
                        onChange={() => togglePermission(m, section)}
                        className="h-3.5 w-3.5 rounded border-input"
                      />
                      {SECTION_LABELS[section]}
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
