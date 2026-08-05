import type { Plan } from "@/types/database";

export function hasFeature(plan: Plan | null | undefined, feature: keyof Plan["features"]): boolean {
  if (!plan) return false;
  return Boolean(plan.features[feature]);
}
