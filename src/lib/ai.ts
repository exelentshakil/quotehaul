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
  if (!apiKey) return fallback;

  const prompt = `Write onboarding content for a UK removal company's website called "${tenant.company_name}". Be warm, trustworthy, concise, no fluff.

Reply with strict JSON only, no markdown: {"faq": [{"question": "...", "answer": "..."} x6], "checklist": "<a moving-day checklist as plain text with newline-separated numbered items, 8-10 items>", "adCopy": "<a short Facebook/Google ad, 2-3 sentences, with a clear call to action>"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
    return {
      faq: Array.isArray(parsed.faq) ? parsed.faq : fallback.faq,
      checklist: parsed.checklist ?? fallback.checklist,
      adCopy: parsed.adCopy ?? fallback.adCopy,
    };
  } catch (err) {
    console.error("[ai] Gemini content generation failed, using fallback", err);
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
  if (!apiKey) return fallback;

  const faqContext = faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const historyText = history.slice(-6).map((h) => `${h.role === "user" ? "Visitor" : "You"}: ${h.text}`).join("\n");
  const prompt = `You are a friendly, concise chat assistant on ${tenant.company_name}'s (a UK removal company) website. Answer the visitor's question in 1-3 short sentences. If you don't know, suggest they use the "Get my estimate" button or call. Never invent a price. Company FAQ for context:\n${faqContext}\n\nConversation so far:\n${historyText}\n\nVisitor: ${message}\nYou:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!res.ok) throw new Error(`Gemini API ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback;
  } catch (err) {
    console.error("[ai] Gemini chat failed, using fallback", err);
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
