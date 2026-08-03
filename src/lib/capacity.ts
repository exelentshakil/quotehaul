const HOURS_BY_SIZE: Record<string, number> = {
  studio: 3, "1_bed": 3, "2_bed": 4, "3_bed": 5, "4_plus_bed": 6, office: 5,
};

export function estimateJobHours(propertySize: string | null) {
  return HOURS_BY_SIZE[propertySize ?? "2_bed"] ?? 4;
}

export type DayStatus = "open" | "near_capacity" | "full" | "blocked" | "forced_open";

export function computeDayStatus(totalCapacityHours: number, bookedHours: number, manualOverride: boolean | null): DayStatus {
  if (manualOverride === false) return "blocked";
  if (manualOverride === true) return "forced_open";
  if (totalCapacityHours <= 0) return "open"; // no resources configured yet — don't block bookings
  if (bookedHours >= totalCapacityHours) return "full";
  if (bookedHours >= totalCapacityHours * 0.75) return "near_capacity";
  return "open";
}
