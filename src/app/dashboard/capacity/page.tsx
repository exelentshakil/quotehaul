import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import { estimateJobHours, computeDayStatus } from "@/lib/capacity";
import type { CapacityBlock, CapacityResource, Plan, Quote, Tenant } from "@/types/database";
import { CapacityManager } from "@/components/capacity-manager";
import { Button } from "@/components/ui/button";

const DAYS_AHEAD = 14;

export default async function CapacityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;
  const tenantId = membership.tenant_id;

  const supabase = await createClient();
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single<Tenant>();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", tenant?.plan_id).single<Plan>();
  if (plan?.slug !== "paid") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="mb-2 text-xl font-bold">Capacity & calendar is a Pro feature</h1>
        <p className="mb-4 text-sm text-muted-foreground">Upgrade to plan crew capacity, block dates, and stop double-booking.</p>
        <Button asChild><Link href="/dashboard/settings">Upgrade to Pro</Link></Button>
      </div>
    );
  }

  const today = new Date();
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + DAYS_AHEAD);
  const todayStr = today.toISOString().slice(0, 10);
  const rangeEndStr = rangeEnd.toISOString().slice(0, 10);

  const [{ data: resources }, { data: blocks }, { data: quotes }] = await Promise.all([
    supabase.from("capacity_resources").select("*").eq("tenant_id", tenantId).returns<CapacityResource[]>(),
    supabase.from("capacity_blocks").select("*").eq("tenant_id", tenantId).gte("date", todayStr).lte("date", rangeEndStr).returns<CapacityBlock[]>(),
    supabase
      .from("quotes")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("status", ["confirmed", "sent", "booked"])
      .gte("move_date", todayStr)
      .lte("move_date", rangeEndStr)
      .returns<Quote[]>(),
  ]);

  const totalCapacityHours = (resources ?? []).reduce((sum, r) => sum + Number(r.crew_hours_per_day), 0);
  const blockByDate = new Map((blocks ?? []).map((b) => [b.date, b.is_open]));

  const days = Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const bookedHours = (quotes ?? [])
      .filter((q) => q.move_date === dateStr)
      .reduce((sum, q) => sum + estimateJobHours(q.property_size), 0);
    const override = blockByDate.has(dateStr) ? (blockByDate.get(dateStr) as boolean) : null;
    return {
      date: dateStr,
      bookedHours,
      jobCount: (quotes ?? []).filter((q) => q.move_date === dateStr).length,
      status: computeDayStatus(totalCapacityHours, bookedHours, override),
      override,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Capacity & calendar</h1>
      <CapacityManager resources={resources ?? []} totalCapacityHours={totalCapacityHours} days={days} />
    </div>
  );
}
