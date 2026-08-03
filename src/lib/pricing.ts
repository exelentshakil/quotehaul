import type { RateConfig } from "@/types/database";

export type PricingInput = {
  rateConfig: RateConfig;
  distanceMiles: number;
  propertySize: string; // key into rate_per_room, e.g. "2_bed"
  crewSize?: string; // key into crew_pricing, e.g. "3_person"
  moveDate?: string | null; // ISO date
  needsStairs?: boolean;
  needsPacking?: boolean;
  isSeaCrossing?: boolean;
};

export type PricingResult = {
  low: number;
  high: number;
  breakdown: { label: string; amount: number }[];
  isLongDistance: boolean;
};

function isWeekend(dateStr?: string | null) {
  if (!dateStr) return false;
  const day = new Date(dateStr).getUTCDay();
  return day === 0 || day === 6;
}

// Core estimate engine: distance + property size/volume x tenant rate card + modifiers.
// Output is a range (not a single fixed number) — the app frames this as a guide,
// confirmed by a real person before anything is booked (see human-confirmation workflow).
export function calculateEstimate(input: PricingInput): PricingResult {
  const { rateConfig, distanceMiles, propertySize, crewSize, moveDate, needsStairs, needsPacking, isSeaCrossing } = input;

  const breakdown: { label: string; amount: number }[] = [];

  const roomBase = rateConfig.rate_per_room[propertySize] ?? rateConfig.rate_per_room["2_bed"] ?? 300;
  breakdown.push({ label: "Base rate for property size", amount: roomBase });

  const distanceCost = Math.round(distanceMiles * rateConfig.rate_per_mile);
  breakdown.push({ label: `Distance (${distanceMiles.toFixed(1)} mi)`, amount: distanceCost });

  const crewCost = crewSize ? rateConfig.crew_pricing[crewSize] ?? 0 : 0;
  if (crewCost) breakdown.push({ label: "Extra crew", amount: crewCost });

  const isLongDistance = distanceMiles >= rateConfig.long_distance_threshold_miles;
  if (isLongDistance) {
    breakdown.push({ label: "Long-distance move", amount: rateConfig.surcharges.long_distance });
  }

  if (isSeaCrossing) {
    breakdown.push({ label: "Sea crossing", amount: rateConfig.surcharges.sea_crossing });
  }

  if (needsStairs) {
    breakdown.push({ label: "Stairs / no lift access", amount: rateConfig.surcharges.stairs });
  }

  if (needsPacking) {
    breakdown.push({ label: "Packing service", amount: rateConfig.surcharges.packing });
  }

  if (isWeekend(moveDate)) {
    breakdown.push({ label: "Weekend move", amount: rateConfig.surcharges.weekend });
  }

  const subtotal = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const floor = Math.max(subtotal, rateConfig.minimum_job_price);

  // Present as a range rather than a single number — mirrors the reference
  // product's "instant guide, confirmed by a real person" framing.
  const low = Math.round(floor * 0.92);
  const high = Math.round(floor * 1.12);

  return { low, high, breakdown, isLongDistance };
}
