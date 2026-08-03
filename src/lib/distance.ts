// Distance/geocoding via Google Distance Matrix API. Falls back to a rough
// straight-line estimate if GOOGLE_MAPS_API_KEY isn't configured, so the funnel
// still works end-to-end in local/dev before the key is added.

export type DistanceResult = {
  distanceMiles: number;
  durationMinutes: number;
  isSeaCrossing: boolean;
  usedFallback: boolean;
};

// UK/Ireland sea-crossing heuristic: origin/destination postcodes on opposite
// sides of the Irish Sea (NI/ROI vs GB) get flagged so the pricing engine can
// apply the sea-crossing surcharge. This is a simple prefix heuristic — swap
// for a proper ferry-route lookup if this becomes a v2 priority.
function isLikelySeaCrossing(fromPostcode: string, toPostcode: string): boolean {
  const niOrIrelandPrefixes = ["BT"]; // Northern Ireland postcodes
  const from = fromPostcode.trim().toUpperCase();
  const to = toPostcode.trim().toUpperCase();
  const fromIsNI = niOrIrelandPrefixes.some((p) => from.startsWith(p));
  const toIsNI = niOrIrelandPrefixes.some((p) => to.startsWith(p));
  return fromIsNI !== toIsNI; // one side NI, the other GB mainland
}

export async function getDistance(fromPostcode: string, toPostcode: string): Promise<DistanceResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const seaCrossing = isLikelySeaCrossing(fromPostcode, toPostcode);

  if (!apiKey) {
    // Fallback: assume a moderate local move so the funnel still returns a
    // usable estimate. Replace by setting GOOGLE_MAPS_API_KEY in .env.
    return { distanceMiles: 12, durationMinutes: 25, isSeaCrossing: seaCrossing, usedFallback: true };
  }

  const params = new URLSearchParams({
    origins: fromPostcode,
    destinations: toPostcode,
    units: "imperial",
    key: apiKey,
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`, {
    // Distance Matrix responses for a fixed postcode pair don't change often.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return { distanceMiles: 12, durationMinutes: 25, isSeaCrossing: seaCrossing, usedFallback: true };
  }

  const data = await res.json();
  const element = data?.rows?.[0]?.elements?.[0];

  if (!element || element.status !== "OK") {
    return { distanceMiles: 12, durationMinutes: 25, isSeaCrossing: seaCrossing, usedFallback: true };
  }

  const distanceMiles = element.distance.value / 1609.34;
  const durationMinutes = element.duration.value / 60;

  return { distanceMiles, durationMinutes, isSeaCrossing: seaCrossing, usedFallback: false };
}
