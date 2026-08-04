import { redirect } from "next/navigation";
import Link from "next/link";
import { AreaChart, BadgeDelta, DonutChart, type DeltaType } from "@tremor/react";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getTenantMembership } from "@/lib/dal";
import type { Quote, OrderMessage, LeadScore, QuoteStatus } from "@/types/database";
import { Card } from "@/components/ui/card";
import { StatusBadge, STATUS_LABELS } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Percent, Wallet, Clock, Sparkles, Truck, Activity, MessageSquare, ArrowRight, PieChart } from "lucide-react";

const STATUS_COLORS: Record<QuoteStatus, string> = {
  new: "indigo",
  pending_confirmation: "amber",
  confirmed: "emerald",
  sent: "blue",
  booked: "green",
  lost: "slate",
};

function deltaTypeFor(pct: number | null): DeltaType {
  if (pct === null || Math.abs(pct) < 1) return "unchanged";
  return pct > 0 ? "increase" : "decrease";
}

function monthStart(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

function hoursBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60);
}

export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await getTenantMembership(user.id);
  if (!membership) return <p>No company found for your account.</p>;
  const tenantId = membership.tenant_id;
  const companyName = membership.tenants?.company_name ?? "your company";

  const supabase = await createClient();
  const [{ data: quotesData }, { data: messagesData }, { data: scoresData }] = await Promise.all([
    supabase.from("quotes").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).returns<Quote[]>(),
    supabase.from("order_messages").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).returns<OrderMessage[]>(),
    supabase.from("lead_scores").select("*").eq("tenant_id", tenantId).returns<LeadScore[]>(),
  ]);
  const quotes = quotesData ?? [];
  const messages = messagesData ?? [];
  const scores = scoresData ?? [];

  if (quotes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <EmptyState
          icon={Users}
          title="No leads yet"
          body="Share your quote funnel link and this page will fill up with your business's real performance — leads, conversion, revenue, and response time."
        />
        <Link href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Go to the leads board <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const now = new Date();
  const thisMonth = monthStart(now);
  const lastMonth = monthStart(now, -1);

  const leadsThisMonth = quotes.filter((q) => new Date(q.created_at) >= thisMonth).length;
  const leadsLastMonth = quotes.filter((q) => new Date(q.created_at) >= lastMonth && new Date(q.created_at) < thisMonth).length;
  const leadsTrend = pctChange(leadsThisMonth, leadsLastMonth);

  const bookedTotal = quotes.filter((q) => q.status === "booked").length;
  const conversionRate = quotes.length > 0 ? Math.round((bookedTotal / quotes.length) * 100) : 0;

  const conversionRateFor = (from: Date, to: Date) => {
    const cohort = quotes.filter((q) => new Date(q.created_at) >= from && new Date(q.created_at) < to);
    if (cohort.length === 0) return null;
    return (cohort.filter((q) => q.status === "booked").length / cohort.length) * 100;
  };
  const conversionThisMonth = conversionRateFor(thisMonth, new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const conversionLastMonth = conversionRateFor(lastMonth, thisMonth);
  const conversionTrend = conversionThisMonth !== null && conversionLastMonth !== null ? conversionThisMonth - conversionLastMonth : null;

  const revenueFor = (from: Date, to: Date) =>
    quotes
      .filter((q) => q.status === "booked" && new Date(q.updated_at) >= from && new Date(q.updated_at) < to)
      .reduce((sum, q) => sum + (q.confirmed_price ?? q.estimate_high ?? 0), 0);
  const revenueThisMonth = revenueFor(thisMonth, new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const revenueLastMonth = revenueFor(lastMonth, thisMonth);
  const revenueTrend = pctChange(revenueThisMonth, revenueLastMonth);

  const firstStaffReplyFor = (from: Date, to: Date) => {
    const hours = quotes
      .filter((q) => new Date(q.created_at) >= from && new Date(q.created_at) < to)
      .map((q) => {
        const firstStaffMsg = messages
          .filter((m) => m.quote_id === q.id && m.author_type === "staff")
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
        return firstStaffMsg ? hoursBetween(q.created_at, firstStaffMsg.created_at) : null;
      })
      .filter((h): h is number => h !== null);
    return hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : null;
  };
  const avgResponseHours = firstStaffReplyFor(new Date(0), new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const avgResponseThisMonth = firstStaffReplyFor(thisMonth, new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const avgResponseLastMonth = firstStaffReplyFor(lastMonth, thisMonth);
  // Inverted: a faster (lower) response time is an improvement, so a
  // decrease in hours should read as a positive/"increase"-styled badge.
  const responseTrend = avgResponseThisMonth !== null && avgResponseLastMonth !== null && avgResponseLastMonth !== 0
    ? -((avgResponseThisMonth - avgResponseLastMonth) / avgResponseLastMonth) * 100
    : null;

  const aiFollowUpsThisMonth = scores.filter((s) => new Date(s.generated_at) >= thisMonth).length;

  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingJobs = quotes
    .filter((q) => (q.status === "booked" || q.status === "confirmed") && q.move_date)
    .filter((q) => {
      const d = new Date(q.move_date as string);
      return d >= now && d <= weekFromNow;
    })
    .sort((a, b) => new Date(a.move_date as string).getTime() - new Date(b.move_date as string).getTime());
  const upcomingBookedPct = upcomingJobs.length > 0 ? Math.round((upcomingJobs.filter((q) => q.status === "booked").length / upcomingJobs.length) * 100) : 0;

  const dailyBuckets = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const count = quotes.filter((q) => new Date(q.created_at) >= dayStart && new Date(q.created_at) < dayEnd).length;
    return { day: dayStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), Leads: count };
  });

  const revenueDailyBuckets = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const sum = quotes
      .filter((q) => q.status === "booked" && new Date(q.updated_at) >= dayStart && new Date(q.updated_at) < dayEnd)
      .reduce((s, q) => s + (q.confirmed_price ?? q.estimate_high ?? 0), 0);
    return { day: dayStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), Revenue: sum };
  });

  const statusBreakdown = (Object.keys(STATUS_LABELS) as QuoteStatus[])
    .map((status) => ({ name: STATUS_LABELS[status], value: quotes.filter((q) => q.status === status).length, color: STATUS_COLORS[status] }))
    .filter((d) => d.value > 0);

  type ActivityEvent = { at: string; href: string; node: React.ReactNode };
  const activity: ActivityEvent[] = [
    ...quotes.map((q) => ({
      at: q.created_at,
      href: `/dashboard/leads/${q.id}`,
      node: (
        <>
          <Avatar name={q.customer_name ?? "?"} className="h-7 w-7 text-[10px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm"><span className="font-medium">{q.customer_name ?? "A visitor"}</span> requested a quote — {q.from_postcode} → {q.to_postcode}</p>
            <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <StatusBadge status={q.status} />
        </>
      ),
    })),
    ...messages.map((m) => ({
      at: m.created_at,
      href: `/dashboard/leads/${m.quote_id}`,
      node: (
        <>
          <Avatar name={m.author_name ?? (m.author_type === "customer" ? "Customer" : "Team")} className="h-7 w-7 text-[10px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm"><span className="font-medium">{m.author_name ?? (m.author_type === "customer" ? "A customer" : "Your team")}</span> sent a message</p>
            <p className="truncate text-xs text-muted-foreground">{m.body}</p>
          </div>
        </>
      ),
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">How {companyName} is performing right now.</p>
      </div>

      <Card className="overflow-hidden p-6 shadow-card sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_1.3fr] sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Revenue booked this month</p>
              <BadgeDelta deltaType={deltaTypeFor(revenueTrend)} size="xs">{revenueTrend === null ? "New" : `${Math.round(revenueTrend)}%`}</BadgeDelta>
            </div>
            <p className="mt-2 font-display text-5xl font-bold tracking-tight">£{revenueThisMonth.toLocaleString()}</p>
            <p className="mt-2 text-sm text-muted-foreground">{bookedTotal} job{bookedTotal === 1 ? "" : "s"} booked, all time — the number that pays for QuoteHaul</p>
          </div>
          <AreaChart
            data={revenueDailyBuckets}
            index="day"
            categories={["Revenue"]}
            colors={["emerald"]}
            showLegend={false}
            showYAxis={false}
            showGridLines={false}
            className="h-28"
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" /> Leads this month</p>
            <BadgeDelta deltaType={deltaTypeFor(leadsTrend)} size="xs">{leadsTrend === null ? "New" : `${Math.round(leadsTrend)}%`}</BadgeDelta>
          </div>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight">{leadsThisMonth}</p>
          <AreaChart
            data={dailyBuckets}
            index="day"
            categories={["Leads"]}
            colors={["indigo"]}
            showLegend={false}
            showYAxis={false}
            showGridLines={false}
            showXAxis={false}
            showTooltip={true}
            className="mt-3 h-16"
          />
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Percent className="h-3.5 w-3.5" /> Conversion</p>
            <BadgeDelta deltaType={deltaTypeFor(conversionTrend)} size="xs">{conversionTrend === null ? "New" : `${Math.round(conversionTrend)}pt`}</BadgeDelta>
          </div>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight">{conversionRate}%</p>
          <p className="mt-2 text-xs text-muted-foreground">{bookedTotal} of {quotes.length} leads booked, all time</p>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" /> First reply time</p>
            <BadgeDelta deltaType={deltaTypeFor(responseTrend)} size="xs">{responseTrend === null ? "New" : `${Math.round(responseTrend)}%`}</BadgeDelta>
          </div>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight">
            {avgResponseHours === null ? "—" : avgResponseHours < 1 ? `${Math.round(avgResponseHours * 60)}m` : `${avgResponseHours.toFixed(1)}h`}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Lead submitted → first staff reply</p>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> AI follow-ups drafted</p>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight">{aiFollowUpsThisMonth}</p>
          <p className="mt-2 text-xs text-muted-foreground">This month, for leads that went quiet</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold"><PieChart className="h-4 w-4 text-primary" /> Lead status breakdown</h2>
          </div>
          {statusBreakdown.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="p-5">
              <DonutChart
                data={statusBreakdown}
                category="value"
                index="name"
                colors={statusBreakdown.map((d) => d.color)}
                className="h-36"
                showAnimation
              />
              <ul className="mt-3 space-y-1">
                {statusBreakdown.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{d.name}</span>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold"><Truck className="h-4 w-4 text-primary" /> Jobs in the next 7 days</h2>
            <span className="text-lg font-semibold">{upcomingJobs.length}</span>
          </div>
          {upcomingJobs.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Nothing booked in the next 7 days.</p>
          ) : (
            <>
              <div className="px-5 pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Booked</span>
                  <span>{upcomingBookedPct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${upcomingBookedPct}%` }} />
                </div>
              </div>
              <ul className="mt-2 divide-y divide-border">
                {upcomingJobs.map((q) => (
                  <li key={q.id}>
                    <Link href={`/dashboard/leads/${q.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-accent/50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{q.customer_name ?? "Customer"} — {q.from_postcode} → {q.to_postcode}</p>
                        <p className="text-xs text-muted-foreground">{new Date(q.move_date as string).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                      </div>
                      <StatusBadge status={q.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card className="shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" /> Recent activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((e, i) => (
                <li key={i}>
                  <Link href={e.href} className="flex items-center gap-3 p-4 hover:bg-accent/50">
                    {e.node}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Link href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <MessageSquare className="h-4 w-4" /> View the full leads board <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
