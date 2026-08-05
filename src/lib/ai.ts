import type { Quote, RateConfig, Tenant } from "@/types/database";
import { buildDefaultContent } from "@/lib/puck-config";

const PAGE_BLOCK_SCHEMA = `- Hero: heading, subheading, ctaLabel (all text) — always the first block
- ValueProps: items (comma-separated short claims, no numbers/stats)
- ServiceGrid: items (array of {title, body, icon}) — icon must be one of: Home, Truck, Building2, PackageCheck, Warehouse, Users, ShieldCheck, Clock, MapPin, Boxes. 3 services this company offers.
- ImageTextSplit: heading, body, linkLabel (text), reverse ("true" or "false") — an About/why-us section, no image fields (leave imageUrl unset)
- QuoteBanner: text (one short, warm, italicized statement — not a fake customer testimonial, a company promise/philosophy)
- BenefitsSplit: heading, body (text), items (comma-separated short benefit phrases)
- FeatureGrid: items (array of {title, body})
- Steps: items (array of {title, body}), 3 steps describing how the quote-to-booking process works
- LiveFAQ: heading (text) — content is pulled live from the company's real FAQ, do not invent Q&As
- CTASection: heading (text), buttonLabel (text) — always the last block
- TextBlock: text (text)
- TrustBadges / Divider: no meaningful editable text

A great page uses 6-9 blocks in a sensible order: Hero, then a mix of ValueProps/ServiceGrid/ImageTextSplit/QuoteBanner/BenefitsSplit/Steps, then LiveFAQ, then CTASection last.`;

export type PuckContent = { type: string; props: Record<string, unknown> }[];

export type LeadScoreResult = { score: number; factors: Record<string, number | string | boolean>; followUpDraft: string };

/**
 * Rules-based fallback engine for lead scoring evaluations.
 */
function ruleBasedFallback(quote: Quote, tenant: Tenant): LeadScoreResult {
  return {
    score: 50,
    factors: { reasons: "Fallback logic applied due to missing or failed remote AI execution." },
    followUpDraft: `Hi there, we noticed your moving inquiry with ${tenant.company_name}. Let us know if we can help you with your journey from ${quote.from_postcode} to ${quote.to_postcode}!`,
  };
}

/**
 * 1. METHOD: scoreLeadAndDraftFollowUp
 * Evaluates moving-company leads and drafts follow-up text using the Gemini REST API gateway.
 */
export async function scoreLeadAndDraftFollowUp(quote: Quote, tenant: Tenant): Promise<LeadScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = ruleBasedFallback(quote, tenant);

  if (!apiKey) {
    console.error("[ai] scoreLeadAndDraftFollowUp: GEMINI_API_KEY is not set in this environment");
    return fallback;
  }

  const hoursSinceCreated = (Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60);
  const prompt = `You are scoring a moving-company lead for how likely it is to convert into a booked job, and drafting a short, friendly follow-up message if it's gone quiet.

Lead: from ${quote.from_postcode} to ${quote.to_postcode}, moving ${quote.move_date ?? "date not set"}, property size ${quote.property_size ?? "unknown"}, estimate £${quote.estimate_low}-£${quote.estimate_high}, status "${quote.status}", ${hoursSinceCreated.toFixed(0)} hours since submitted, contact details ${quote.customer_email ? "provided" : "missing"}.
Company: ${tenant.company_name}.

Reply with strict JSON only, no markdown: {"score": <0-100 integer>, "reasons": ["short reason", ...], "followUp": "<2-3 sentence friendly follow-up message from ${tenant.company_name} to the customer, signed off with the company name>"}`;

  try {
    // FIXED: Target standard v1beta gateway route using key parameters
    const url = `https://googleapis.com{apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();

    // FIXED: Safe deep tree extraction pattern for Gemini REST returns
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No textual response returned from Gemini API.");

    const parsed = JSON.parse(text);

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      factors: { reasons: parsed.reasons?.join("; ") ?? "" },
      followUpDraft: parsed.followUp ?? fallback.followUpDraft,
    };
  } catch (err) {
    console.error("[ai] scoreLeadAndDraftFollowUp: Gemini call failed, using fallback —", err);
    return fallback;
  }
}

/**
 * 2. METHOD: answerFunnelQuestion
 * RESTORED: Analyzes customer questions submitted via the booking conversion layout interface.
 */
export async function answerFunnelQuestion(question: string, tenant: Tenant): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackMessage = `Thanks for your question! A member of the ${tenant.company_name} team will review this and get back to you shortly.`;

  if (!apiKey) return fallbackMessage;

  const prompt = `You are a customer support agent for "${tenant.company_name}", a moving/removal company in the UK. 
Answering this customer question regarding their move: "${question}".
Provide a concise, helpful, and polite response in 1-2 sentences max. Do not invent pricing or technical constraints if not known.`;

  try {
    const url = `https://googleapis.com{apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) throw new Error(`Gemini status ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : fallbackMessage;
  } catch (err) {
    console.error("[ai] answerFunnelQuestion failed:", err);
    return fallbackMessage;
  }
}

/**
 * 3. METHOD: buildLayoutPrompt
 * Combines available real-time tenant profile datasets to produce descriptive, unique layout directives.
 */
function buildLayoutPrompt(tenant: Tenant, prompt: string, rateConfig?: RateConfig | null): string {
  const propertyTypes = rateConfig ? Object.keys(rateConfig.rate_per_room).join(", ") : null;
  const details = [
    tenant.branding?.phone ? `Phone: ${tenant.branding.phone}` : null,
    propertyTypes ? `Property types this company prices for: ${propertyTypes}` : null,
    rateConfig?.service_radius_miles ? `Local service radius: ${rateConfig.service_radius_miles} miles` : null,
    rateConfig?.long_distance_threshold_miles ? `Treats moves over ${rateConfig.long_distance_threshold_miles} miles as long-distance` : null,
  ].filter(Boolean).join("\n");

  return `Generate a landing page layout for "${tenant.company_name}", a UK removal (moving) company, using ONLY these block types and fields:\n${PAGE_BLOCK_SCHEMA}\n\n${details ? `Known details about this specific company:\n${details}\n\n` : ""}Company's request: ${prompt}\n\nVary the block selection, order, and copy meaningfully based on this company's specific details and request — do not default to the same generic structure every time. Reply with strict JSON only, no markdown: an array of {"type": "<BlockName>", "props": {...matching fields for that type...}}. Always start with a Hero block. Give each block props a unique "id" string.`;
}

/**
 * 4. METHOD: parseLayoutJson
 * Safely parses and asserts layout contents to prevent corrupt rendering actions inside Puck.
 */
function parseLayoutJson(text: string): PuckContent {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Empty layout returned");
  return parsed;
}

/**
 * 5. METHOD: generateLayoutViaOpenAI
 * OpenAI fallback framework executing landing page fallback procedures when OpenAI tokens are set.
 */
async function generateLayoutViaOpenAI(fullPrompt: string): Promise<PuckContent | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Reply with a JSON object of shape {\"blocks\": [...]} where blocks is the requested array. Never wrap in markdown." },
          { role: "user", content: fullPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`OpenAI API ${res.status}: ${body}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty chat completion payload received.");

    const parsed = JSON.parse(text);
    const blocks = Array.isArray(parsed) ? parsed : parsed.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) throw new Error("Empty layout returned");
    return blocks;
  } catch (err) {
    console.error("[ai] generateLayoutViaOpenAI: OpenAI fallback failed —", err);
    return null;
  }
}

/**
 * 6. METHOD: generateLayoutViaGemini
 * RESTORED & COMPLETED: Core Gemini "assembly mode" engine layout construction processor loop.
 */
export async function generateLayoutViaGemini(tenant: Tenant, prompt: string, rateConfig?: RateConfig | null): Promise<PuckContent> {
  const apiKey = process.env.GEMINI_API_KEY;
