import type { Quote, Tenant } from "@/types/database";

export type LeadScoreResult = { score: number; factors: Record<string, number | string | boolean>; followUpDraft: string };

// Single AI entry point so the provider (Gemini today) is swappable per
// feature without touching call sites. Falls back to a rule-based score and
// a template follow-up if no API key is set, so the app runs end-to-end
// without one — same pattern as the distance/email/SMS integrations.
export async function scoreLeadAndDraftFollowUp(quote: Quote, tenant: Tenant): Promise<LeadScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = ruleBasedFallback(quote, tenant);
  if (!apiKey) return fallback;

  const hoursSinceCreated = (Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60);
  const prompt = `You are scoring a moving-company lead for how likely it is to convert into a booked job, and drafting a short, friendly follow-up message if it's gone quiet.

Lead: from ${quote.from_postcode} to ${quote.to_postcode}, moving ${quote.move_date ?? "date not set"}, property size ${quote.property_size ?? "unknown"}, estimate £${quote.estimate_low}-£${quote.estimate_high}, status "${quote.status}", ${hoursSinceCreated.toFixed(0)} hours since submitted, contact details ${quote.customer_email ? "provided" : "missing"}.
Company: ${tenant.company_name}.

Reply with strict JSON only, no markdown: {"score": <0-100 integer>, "reasons": ["short reason", ...], "followUp": "<2-3 sentence friendly follow-up message from ${tenant.company_name} to the customer, signed off with the company name>"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      factors: { reasons: parsed.reasons?.join("; ") ?? "" },
      followUpDraft: parsed.followUp ?? fallback.followUpDraft,
    };
  } catch (err) {
    console.error("[ai] Gemini scoring failed, using fallback", err);
    return fallback;
  }
}

function ruleBasedFallback(quote: Quote, tenant: Tenant): LeadScoreResult {
  let score = 50;
  if (quote.customer_email && quote.customer_phone) score += 15;
  if (quote.move_date) score += 15;
  const hoursSinceUpdate = (Date.now() - new Date(quote.updated_at).getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate > 48) score -= 20;
  if (quote.status === "confirmed" || quote.status === "sent") score += 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: { note: "Rule-based estimate (set GEMINI_API_KEY for AI scoring)" },
    followUpDraft: `Hi ${quote.customer_name ?? "there"}, just checking in about your move from ${quote.from_postcode} to ${quote.to_postcode} — happy to answer any questions or lock in your date. — ${tenant.company_name}`,
  };
}
