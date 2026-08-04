import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { Quote } from "@/types/database";
import { StatCard } from "@/components/ui/stat-card";
import { KanbanBoard } from "@/components/kanban-board";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;

  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("tenant_id", membership.tenant_id)
    .order("created_at", { ascending: false })
    .returns<Quote[]>();

  const all = quotes ?? [];
  const open = all.filter((q) => !["booked", "lost"].includes(q.status)).length;
  const booked = all.filter((q) => q.status === "booked").length;
  const value = all.reduce((sum, q) => sum + (q.confirmed_price ?? q.estimate_high ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open leads" value={open} />
        <StatCard label="Booked" value={booked} />
        <StatCard label="Pipeline value" value={`£${value.toLocaleString()}`} hint="Confirmed prices, or estimate high" />
      </div>

      {all.length === 0 ? (
        <EmptyState icon={Inbox} title="No leads yet" body="Share your quote funnel link and new enquiries will land here automatically." />
      ) : (
        <KanbanBoard quotes={all} />
      )}
    </div>
  );
}
