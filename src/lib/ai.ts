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

// Single AI entry point so the provider (Gemini today) is swappable per
// feature without touching call sites. Falls back to a rule-based score and
// a template follow-up if no API key is set, so the app runs end-to-end
// without one — same pattern as the distance/email/SMS integrations.
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
    const res = await fetch(
        // UPDATED: Standardized to the recommended active interactions endpoint
        `https://googleapis.com{apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.6-flash", // UPDATED: Upgraded to active mainline model
            input: prompt,             // UPDATED: Flat input field

            // UPDATED: Modern configuration format required for JSON generation
            response_format: {
              mime_type: "application/json"
            }
          })
        }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();

    // UPDATED: Extracted via the new direct output_text helper property
    const text = data.output_text;
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

// Builds the shared prompt for both providers — pulls in every bit of real
// tenant data available (not just company name) so repeated generations for
// different companies actually diverge instead of converging on the same
// generic 6-9 block structure.
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

function parseLayoutJson(text: string): PuckContent {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Empty layout returned");
  return parsed;
}

// OpenAI fallback — only attempted if OPENAI_API_KEY is set; a plain fetch
// call (same style as the Gemini calls above) rather than pulling in the
// full SDK for one endpoint. Silently unavailable if the key is unset, same
// graceful-degradation pattern as the rest of this file.
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
    const parsed = JSON.parse(text);
    const blocks = Array.isArray(parsed) ? parsed : parsed.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) throw new Error("Empty layout returned");
    return blocks;
  } catch (err) {
    console.error("[ai] generateLayoutViaOpenAI: OpenAI fallback failed —", err);
    return null;
  }
}

// Gemini "assembly mode" — composes a page from the existing registered Puck
// blocks only (never invents new component types, see PRD §4.1). Falls back
// to OpenAI (if configured) and then the rich default template on failure,
// so a regenerate attempt can never leave the tenant with a broken page.
export async function generatePageLayout(tenant: Tenant, prompt: string, rateConfig?: RateConfig | null): Promise<PuckContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fullPrompt = buildLayoutPrompt(tenant, prompt, rateConfig);

  if (!apiKey) {
    console.error("[ai] generatePageLayout: GEMINI_API_KEY is not set in this environment");
    return (await generateLayoutViaOpenAI(fullPrompt)) ?? buildDefaultContent(tenant);
  }

  try {
    const res = await fetch(
        // UPDATED: Points to the recommended active interactions endpoint
        `https://googleapis.com{apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.6-flash", // UPDATED: Upgraded to active mainline model
            input: fullPrompt,         // UPDATED: Simplified flat input field

            // UPDATED: Modern configuration format required for JSON generation
            response_format: {
              mime_type: "application/json"
            }
          })
        }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();

    // UPDATED: Extracted via the clean, direct output_text property
    return parseLayoutJson(data.output_text);

  } catch (err) {
    console.error("[ai] generatePageLayout: Gemini call failed, trying OpenAI fallback —", err);
    return (await generateLayoutViaOpenAI(fullPrompt)) ?? buildDefaultContent(tenant);
  }

}

export type OnboardingContent = {
  faq: { question: string; answer: string }[];
  checklist: string;
  adCopy: string;
};

// Runs once at onboarding (or on demand from Settings) to draft the FAQ,
// checklist page, and starter ad copy from a few basic company inputs —
// the fastest live-demo moment in the product, per the PRD.
export async function generateOnboardingContent(tenant: Tenant): Promise<OnboardingContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = onboardingFallback(tenant);
  if (!apiKey) {
    console.error("[ai] generateOnboardingContent: GEMINI_API_KEY is not set in this environment");
    return fallback;
  }

  const prompt = `Write onboarding content for a UK removal company's website called "${tenant.company_name}". Be warm, trustworthy, concise, no fluff.

Reply with strict JSON only, no markdown: {"faq": [{"question": "...", "answer": "..."} x6], "checklist": "<a moving-day checklist as plain text with newline-separated numbered items, 8-10 items>", "adCopy": "<a short Facebook/Google ad, 2-3 sentences, with a clear call to action>"}`;

  try {
    const res = await fetch(
        // UPDATED: Targets the recommended modern interactions endpoint
        `https://googleapis.com{apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.6-flash", // UPDATED: Upgraded to active mainline model
            input: prompt,             // UPDATED: Flat input layout

            // UPDATED: Required structure to enforce JSON format
            response_format: {
              mime_type: "application/json"
            }
          })
        }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();

    // UPDATED: Directly extract the string using the output_text helper property
    const parsed = JSON.parse(data.output_text);

    return {
      faq: Array.isArray(parsed.faq) ? parsed.faq : fallback.faq,
      checklist: parsed.checklist ?? fallback.checklist,
      adCopy: parsed.adCopy ?? fallback.adCopy,
    };
  } catch (err) {
    console.error("[ai] generateOnboardingContent: Gemini call failed, using fallback —", err);
    return fallback;
  }

}

// Cheap, fast model for the public-facing funnel chat widget — cost-sensitive
// since every website visitor can trigger it, unlike the staff-only features.
export async function answerFunnelQuestion(
  tenant: Tenant,
  faq: { question: string; answer: string }[],
  message: string,
  history: { role: "user" | "assistant"; text: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = `Thanks for your message! For a fast answer, use the "Get my estimate" button above, or call ${tenant.company_name} directly on ${tenant.branding?.phone ?? "the number at the top of this page"}.`;
  if (!apiKey) {
    console.error("[ai] answerFunnelQuestion: GEMINI_API_KEY is not set in this environment");
    return fallback;
  }

  const faqContext = faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const historyText = history.slice(-6).map((h) => `${h.role === "user" ? "Visitor" : "You"}: ${h.text}`).join("\n");
  const prompt = `You are a friendly, concise chat assistant on ${tenant.company_name}'s (a UK removal company) website. Answer the visitor's question in 1-3 short sentences. If you don't know, suggest they use the "Get my estimate" button or call. Never invent a price. Company FAQ for context:\n${faqContext}\n\nConversation so far:\n${historyText}\n\nVisitor: ${message}\nYou:`;

  try {
    const res = await fetch(
        // UPDATED: Points directly to the modern interactions endpoint
        `https://googleapis.com{apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // UPDATED: Flat layout, no nested arrays or deprecated sampling parameters
          body: JSON.stringify({
            model: "gemini-3.5-flash-lite", // For highest speed & lower cost
            input: prompt
          })
        }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();
    // UPDATED: Response properties are mapped to the streamlined output_text helper
    return data.output_text?.trim() || fallback;

  } catch (err) {
    console.error("[ai] answerFunnelQuestion: Gemini call failed, using fallback —", err);
    return fallback;
  }
}

function onboardingFallback(tenant: Tenant): OnboardingContent {
  const name = tenant.company_name;
  return {
    faq: [
      { question: "Is the online price a fixed quote?", answer: `No — it's an instant guide based on your move. A member of the ${name} team reviews every enquiry and confirms the exact price before anything is booked.` },
      { question: "How quickly will I hear back?", answer: "We aim to confirm your exact price within a few hours during business hours." },
      { question: "Is there any obligation?", answer: "None. Getting a quote is free and there's no obligation to book." },
      { question: "What areas do you cover?", answer: `${name} covers local moves and can arrange UK-wide relocations on request.` },
      { question: "Do you offer packing?", answer: "Yes — let us know when you request your quote and we'll include it in your price." },
      { question: "How do I book?", answer: "Once your price is confirmed, just reply to your confirmation email or call us to lock in your date." },
    ],
    checklist: "1. Book your move date as early as possible\n2. Declutter before packing\n3. Use sturdy boxes and label by room\n4. Pack an essentials bag for moving day\n5. Confirm parking access at both addresses\n6. Redirect your post and update your address\n7. Take meter readings before you leave\n8. Keep valuables and documents with you",
    adCopy: `Moving house? ${name} gets you a real price in 60 seconds — no phone calls, no obligation. Get your free instant estimate today.`,
  };
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
