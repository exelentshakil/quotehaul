import type { Plan } from "@/types/database";

export function hasFeature(plan: Plan | null | undefined, feature: keyof Plan["features"]): boolean {
  if (!plan) return false;
  return Boolean(plan.features[feature]);
}

// Returns true if the tenant is at/over its monthly lead cap (free tier only).
export function isOverLeadCap(plan: Plan | null | undefined, leadsThisMonth: number): boolean {
  if (!plan || plan.monthly_lead_cap === null) return false;
  return leadsThisMonth >= plan.monthly_lead_cap;
}
