# PRD v4: QuoteHaul — Pay-from-Day-One SaaS for Removal Companies

**Model:** Single-tenant SaaS, one isolated account per removal company. **No trial — £97/month Pro, billed immediately at signup**, or a capped, branded Free tier for anyone who doesn't check out.
**Status:** Supersedes all earlier drafts of this document (network/broker mode removal, Wayfront-pattern order/messaging, trial-vs-forever-free reversal, launch scope trimmed for solo-founder sustainability, and now: **the trial itself has been removed entirely**). Every reference below to a "7-day trial" (§1, §3.3, §5, personas) is superseded — real reasoning: with paid ad spend driving signups, the business can't fund a week-plus wait hoping for conversion; serious buyers pay from day one, and card-required-trial was already most of the filtering benefit anyway. v1's MVP (this repo) is the foundation being extended, not replaced. **As of this revision, everything tagged V1 and V1.5 below has actually shipped** — Kanban, order messaging, AI lead scoring, capacity/calendar, AI content-gen, AI chat concierge, and the Puck-based page builder are all live. §4.5 (Invoicing) has one deliberate deviation from what's written below — see the note at the top of that section for the current, final decision on Stripe Connect.
**References:**
- Belfast House Removals (belfasthouseremovals.co.uk) — proves the "instant estimate + human confirms every quote" funnel converts.
- **Wayfront** (the client-portal SaaS behind the "Wayfront alternative for movers" framing this product started from) — observed live via a real customer (TheITIN's ITIN-application portal): order-centric dashboard, schema-driven order detail view, threaded in-order messaging with file attachments and reply-by-email. This is the concrete UX pattern this PRD builds toward for order/quote management.
- **Jobber / Housecall Pro** — the closer analogues for the actual growth motion: both trial-gate rather than run a forever-free tier, which is the model this PRD now follows instead of the Crisp-style freemium explored in an earlier draft (see §1 for why).

---

## 0. What Ships on Day One (read this first)

This PRD tags every feature **[V1 — Launch]**, **[V1.5 — Fast-follow]**, or **[V2+ — Later]**. The distinction is deliberate and load-bearing, not a wishlist ranking: **V1 is scoped to what one person can build, ship, and personally support daily without burning out**, using revenue from real paying customers to fund and prioritize V1.5 rather than guessing all of it upfront before a single sale closes.

**V1 — what actually launches and is sellable at £97/mo:**
- The branded quote funnel, wizard, and instant estimate (already built in this repo).
- The human-confirmation workflow (already built).
- The full Wayfront-pattern order/messaging experience (Project data panel, threaded messages, inbound-email reply parsing) — the single biggest differentiator, built in full, not stubbed.
- The Kanban leads board (without automation rules).
- One AI feature: lead scoring + AI-drafted follow-up copy.
- Full white-label branding removal + custom domain + SMS, gated behind Pro.
- Trial/subscription billing (Stripe) that actually charges the card after 7 days.

**V1.5 — real, planned, but shipped weeks after launch once early customers are paying and giving feedback:** Kanban automation rules, capacity/calendar, invoicing & deposit collection (Stripe Connect), AI onboarding content generation, AI chat concierge, Puck-based drag-drop page builder.

**V2+ — longer-term, not committed to a date:** AI photo/video inventory estimation, crew/vehicle-level dispatch, deposit/refund workflow UI, per-transaction platform fees.

This isn't a smaller vision — it's the same destination reached without betting weeks of unpaid build time on features no customer has asked for yet.

---

## 1. Executive Summary & Positioning

Removal companies today either quote by phone (slow, loses jobs to whoever answers first) or use a moving-specific CRM (SmartMoving, Supermove, MoversTech, Moveware) that covers dispatch/ops breadth but treats the *quoting funnel itself* as an afterthought — a plain form, not a conversion engine, and none of them turn "a real person confirms every AI-assisted quote" into a first-class, trust-building workflow. That's the wedge this product is built around, the same mechanic that makes Belfast House Removals' own funnel work.

**QuoteHaul is not "a form builder for movers."** Even at V1 scope, it's the branded funnel that wins the lead, the Kanban board that stops leads from dying in an inbox, the order/messaging experience that makes the company look like a real operation, and the AI that nudges stalled leads back to life — a bundle a $19/mo Jobber seat or a free Wix contact form doesn't replicate.

**One buyer, one product, no marketplace:** every signup is a single removal company running its own fully isolated instance. There is no lead-matching or broker layer between companies — each company owns 100% of its own leads and data. (An earlier draft explored a multi-mover "network/broker" mode inspired by Belfast House Removals' own business model; that's permanently dropped — see §8.)

**Growth model: 7-day full-access trial, card required, not a forever-free tier.** An earlier draft of this PRD proposed a Crisp-style forever-free branded tier with no card required. That's wrong for this product specifically: Crisp's free tier is nearly free to *run* (it's a chat-message relay), so unlimited free users cost almost nothing. This product isn't that — every signup, free or paid, costs real money (Google Distance Matrix calls per quote, transactional emails per order/message, file storage, hosting compute) and real founder time (support), whether or not they ever pay. A no-card, no-expiry free tier is an open-ended liability: it attracts signups with no pressure to ever convert or leave, and a solo founder ends up paying to support people who will never pay him. Comparable products in this exact space (Jobber, Housecall Pro) trial-gate rather than freemium-gate, which is the better-fitting pattern here:
- **Trial: 7 days, full Pro feature access, card required up front.** Card-on-file both filters for real buying intent (this is a considered $120+/mo B2B purchase, not an impulse tool) and makes conversion frictionless — the card just starts being charged at day 7 unless they cancel.
- **After the trial:** either they're now paying Pro, or the account **auto-downgrades to a capped, branded Free tier** (doesn't get deleted) — this keeps the branding-lock marketing benefit ("Powered by QuoteHaul" on their public pages) working indefinitely as a low-cost, bounded-liability retention/reactivation pool, without the risk of unlimited never-paying accounts.

**Why £97/mo is defensible:**
- The full trial experience (unlimited leads, AI, custom domain, SMS) is what sells the upgrade — they've already felt what losing it would mean by day 7.
- Beyond that, it replaces a $19–59/mo CRM seat *and* an admin doing manual lead follow-up *and* looking unbranded/unprofessional — bundled and specific to this industry's quirks instead of generic field-service software.
- The value story is measurable: leads converted, hours of admin saved — a P&L line, not just "a tool."

---

## 2. Personas & Buyer Psychology

### 2.1 Company Owner / Office Manager (the buyer)
Not technical. Currently loses leads to slow response times and runs pricing "in their head" or on a spreadsheet. Wants to look as professional as a national brand without hiring a web agency. Signs up for the trial because it's a real, considered decision (card required) — they're evaluating, not just curious. Converts at day 7 because losing unlimited leads, AI follow-up, and their own domain after a week of relying on them is a real loss, not an abstract "upgrade for more features" pitch.

### 2.2 End Customer (the person moving house)
Wants a price fast, doesn't want to ring five companies, doesn't fully trust an instant online number, wants to know a human will check it before anything's final, and wants an easy way to find their quote again if they don't book immediately. Never wants to create an account for a one-time transaction. Once a quote becomes a real order, they expect it treated like one: a clear status, a place to ask questions and get replies (ideally without logging into yet another portal — email should just work), and confidence someone's actually looking at their move. This is exactly the order/messaging experience observed in the Wayfront/TheITIN reference (§4.1) and is V1, not a later add-on.

### 2.3 Platform Admin (superadmin — you)
Needs to see, at a glance: who's trialing and when their card gets charged, who converted, who downgraded to Free, and whose usage looks like a support risk — this is now a billing-state dashboard as much as a tenant list, because the trial-to-paid mechanic is the core growth engine, not a side detail.

---

## 3. Business Model, Tenancy & Billing Architecture

### 3.1 Tenancy model
The existing schema already has `tenants`, `tenant_users`, `rate_configs`, `quotes`, `content_pages`, `faq_items` under Supabase RLS — this stays the backbone, unchanged in shape. Each row in `tenants` is one independent company, full stop — no parent/child tenant relationships, no shared-lead constructs.

- **`tenants.plan`**: `trialing` | `pro` | `free` (downgraded). `tenants.trial_ends_at` drives the trial countdown and the downgrade job (§3.3).
- **Branding-lock enforcement is a single, centralized check**, not scattered conditionals: one server-side helper (e.g. `getTenantBranding(tenant)`) that every public page render and every email template calls, forcing the platform logo/footer/"Powered by QuoteHaul" whenever `plan === 'free'`, and returning the tenant's own branding for `trialing` and `pro`. Every new page or email template must route through this helper.

### 3.2 Data isolation
Existing Supabase RLS-per-`tenant_id` pattern is the isolation boundary, unchanged. No new isolation model needed.

### 3.3 Trial & Subscription Billing **[V1 — Launch]**
This is the mechanism that makes the whole growth model real, so it's core V1, not an afterthought bolted on after the product exists:
- **Stripe Billing (Subscriptions)** — a distinct integration from Stripe Connect (§4.5, which is about *tenants'* customers paying *them*; this is about the tenant paying *us*). Card collected at signup via Stripe Checkout/Elements, subscription created in `trialing` status with a 7-day trial period, auto-transitions to `active` (and starts billing) unless canceled.
- **`tenants.stripe_customer_id`, `tenants.stripe_subscription_id`** track the relationship; Stripe webhooks (`customer.subscription.trial_will_end`, `.updated`, `.deleted`) drive `tenants.plan` transitions.
- **Downgrade job**: a scheduled function (Vercel Cron or Supabase scheduled function) checks for trials past `trial_ends_at` with no active subscription and flips `plan` to `free`, applying the lead cap and branding lock immediately — no manual intervention needed to keep the founder from having to babysit this daily.
- A trial-ending reminder email (day 11 or 12) via the existing Resend integration, so no one is surprised by the charge.

---

## 4. Full Feature Set

### 4.1 Public Quote Funnel & Order/Messaging Experience

- **[V1] Config-driven landing page.** Company edits structured settings via dashboard forms — logo, color scheme, hero copy, which trust badges show, FAQ content, section order/visibility. On a downgraded Free account, all of this works except the platform-branding footer/watermark can't be removed.
- **[V1] Multi-step wizard** (postcodes → date → property size/inventory → instant estimate → contact details → confirmation) — already built in v1, kept as-is; validated by Belfast House Removals' live conversion funnel.
- **[V1] Instant estimate engine** — distance (Google Distance Matrix, already integrated) + volume/room bands + rate card + modifiers (stairs, packing, weekend, sea crossing/long-distance), returned as a range, explicitly labeled as a guide.
- **[V1] Order/quote detail experience — built in full at launch, to the Wayfront-observed pattern, not a lighter placeholder:**
  - A **schema-driven "Project data" panel**: whatever fields the customer filled in on the intake wizard are rendered read-only as labeled rows on the order. The same field-schema definition drives both the wizard *and* this summary view.
  - A **threaded message panel** on every order — rich text, drag-and-drop file attachments, CC — visible to both the customer (via their magic-link order page) and staff (inside the dashboard's order view). One shared conversation.
  - **Inbound email reply parsing.** Every new thread message triggers a branded "Order updated" notification email with a hidden per-order/per-message reply token ("reply above this line"). A reply is received via an inbound-email webhook, matched by token, and posted back into the thread automatically. This is the single most-praised mechanic in the reference product — it's why this whole panel is V1, not deferred.
  - **Magic-link access, no login** — the customer's link is the existing saved-quote token, extended to show live status plus the panel and thread above.
- **[V1.5] AI chat concierge** embedded in the funnel widget — conversational alternative to the static form. The wizard already converts without it; this is a differentiator to add once there's a paying base to fund it.
- **[V1.5] Puck-based drag-drop page builder** (`@measured/puck`, open-source, MIT-licensed) — registers the shared component library (§4.7) as draggable blocks, giving true layout freedom beyond the config-driven sections. Config-driven sections already close the sale; this is a retention/wow upgrade for existing customers.
  - **AI-assisted assembly, built in-house rather than buying Puck AI (Measured's paid hosted add-on).** "Assembly mode" — an agent composing a page from existing registered components — is just constrained JSON generation against Puck's own content-tree schema: each component already has typed props, so a prompt + that schema + Gemini's structured-output/function-calling mode produces a valid Puck document directly. This slots into the AI-provider abstraction (§4.6) already planned, with no new vendor or subscription cost. **Explicitly not replicating Puck AI's "design mode"** (agent inventing brand-new component types/code at runtime) — that requires safely generating and executing arbitrary React code in production, real risk and engineering weight this product doesn't need, since the design system is deliberately a fixed, curated component library, not an open-ended one.
- **[V2+] AI photo/video inventory estimation** (Yembo-style) — a materially heavier lift (vision API calls, review UI, poor-footage edge cases), validated as a real pattern by Yembo but not needed to prove the business.

### 4.2 Leads / CRM — Kanban Board

- **[V1] Jira/Trello-style Kanban board** as the primary lead-management surface, built with **shadcn/ui + dnd-kit**.
- **[V1] Pipeline stages**, company-customizable beyond the default (new → estimate sent → pending confirmation → confirmed → booked → lost).
- **[V1] Card detail**: full quote data, shared message thread (§4.1), one-click call/email/SMS actions, AI lead score badge.
- **[V1] Filters & search** by status, date range, value, source, assigned staff member.
- **[V1] SLA/aging indicators** on cards — a computed "idle for Xh" badge from existing timestamps; cheap to add since it needs no scheduler, just a render-time calculation.
- **[V1.5] Automation rules** (scheduled trigger + auto-send AI follow-up when a lead idles past a threshold) — needs a real background job/scheduler and rule-config UI, genuinely more engineering than the manual version (staff sees the AI draft, sends it themselves) that ships in V1. Deferred deliberately, not because it's low-value.

### 4.3 Human-Confirmation Workflow

- **[V1] Kept and extended, not replaced.** The trust mechanic that differentiates the product. Staff reviews the AI/rate-card-generated estimate, adjusts for real capacity/rates, and confirms the exact price before it's sent.
- **[V1]** AI lead score and suggested-price nudge alongside the human review screen (AI assists, never auto-sends without a human click — a permanent principle).

### 4.4 Capacity & Calendar **[V1.5 — Pro-only]**

- **Resource-based capacity.** Company defines resources (e.g. "3 vans," "2 crews of 3") with a daily crew-hour capacity; confirmed bookings consume crew-hours; the day auto-closes once full.
- **Manual override always wins** — owner can force-block or force-open regardless of computed capacity.
- Calendar view surfaces both computed availability and manual blocks.
- **Deferred to V1.5 deliberately**: this is genuinely valuable but isn't what closes the first sale (most 1–3 van companies still track this in their heads or a shared calendar today) and the auto-close/override logic is real engineering to get right. It's the first thing to build once there's paying-customer feedback on how they actually want to define "capacity."
- **[V2+]** Crew/vehicle assignment per booking — full dispatch-board territory, overlaps with SmartMoving/Supermove's specialty.

### 4.5 Invoicing & Deposit Collection **[Shipped, then deliberately un-surfaced]**

Moving is not a prepay-then-fulfill business like e-commerce — customers expect to pay on move day or after inspection, and confirmed practice in this market (per direct operator feedback) is: **diary/availability has to be confirmed before payment is even a sensible conversation** — a customer booking "tomorrow" is often actually 7–10 days out once existing commitments are accounted for, and the norm is to invoice **after** delivery, collected however the company already takes payment (bank transfer, card reader, cash). Taking payment upfront, before a slot is even confirmed, is unusual here.

- **Stripe Connect (Standard/Express) onboarding, destination charges, "Request payment" Stripe Payment Links** — all fully built and functional (`/api/stripe/connect/*`, `PaymentsCard.tsx`, `request-payment-panel.tsx`). Confirmed working end-to-end.
- **Final decision: not surfaced in the product UI.** Two reasons, both final: (1) it doesn't match the actual industry workflow above — a Payment Link sent before a job is even confirmed is the wrong sequencing; (2) activating Connect requires the founder to complete a second identity-verification pass on their own personal Stripe account (business profile + ID document review) purely to enable a feature that doesn't fit the workflow — not worth the personal-account risk for a feature the target customer wouldn't use as designed anyway.
- **What ships instead**: a **"Send invoice" panel** (`send-invoice-panel.tsx`) on the order/lead detail page — staff picks a label (Deposit/Balance/Full amount) and amount, optionally adds their own payment instructions (bank details, a payment link they already use), and it posts as a formatted message into the existing order thread — reusing the already-built messaging + reply-by-email infrastructure (§4.1), not a new payment rail.
- The Stripe Connect code is not deleted — if a future customer segment or market has a workflow where in-app collection actually fits, it's a flag-flip away, not a rebuild.
- **[V2+, contingent]** Revisit Stripe Connect only if a real customer explicitly asks for in-app payment collection with a workflow that actually fits (e.g. deposit-only, requested after a slot is confirmed) — not proactively.

### 4.6 AI Features **[Pro-only]**

1. **[V1] Lead scoring + AI-drafted follow-up copy.** Every lead gets a score (completeness, move size/value, response latency) and, for stalled leads, an AI-drafted follow-up email/SMS staff can send with one click or edit first. **The one AI feature that ships at launch** — highest-ROI, measured in *jobs won from leads already paid for*, and the clearest "justifies £97/mo" story of the four originally considered.
2. **[V1.5] AI onboarding content generation.** At signup, AI drafts the company's FAQ, checklist/SEO page, and starter ad copy. A strong demo trick, not required for the product to work day-to-day — fast-follow once there's a base to demo it to.
3. **[V1.5] AI chat concierge on the funnel** — see §4.1.
4. **[V2+] AI photo/video inventory estimation** — see §4.1.

**Provider abstraction:** all AI calls go through a single internal interface (not hard-wired to one vendor) so Gemini and OpenAI models are swappable per feature by cost/quality — e.g. Gemini Flash or GPT-4o-mini for follow-up drafting, keeping per-lead AI cost low from day one.

### 4.7 Shared Design System (Atomic UI + Email) **[V1]**

- **One shared atomic-design component library** — atoms (`StatusBadge`, `Avatar`, `IconButton`), molecules (`StatCard`, `FileChip`, `MessageBubble`), organisms (`OrderHeader`, `MessageThread`, `ProjectDataPanel`, `KanbanCard`) — used consistently across the public funnel, the customer's magic-link order page, and the staff dashboard.
- **React Email for every transactional email** (order-updated notifications, lead confirmation, trial-ending reminder, follow-up drafts), built on the existing Resend dependency. Shares design tokens with the web components so a status pill looks the same everywhere.
- **Why V1, not deferred:** this is the direct mechanism for "every page and email should look great, easy to manage, low token/time" — building it after the fact means retrofitting every page and template already built. Doing it first is cheaper, not just tidier.

### 4.8 Branding & Custom Domains **[V1 — custom domain is Pro-only; subdomain is on trial/free]**

- **Subdomain per tenant** (`companyA.ourdomain.com`) working out of the box at signup — no manual DNS step.
- **Custom domain support (Pro-only)** via the **Vercel Domains API** — programmatic assignment with automatic SSL, following Vercel's own Platforms Starter Kit pattern (already partially present in `src/middleware.ts`).
- Theme/config system: logo, color scheme, typography, phone number — persisted per tenant, rendered via the branding-lock helper (§3.1).

### 4.9 Admin / Superadmin

- **[V1]** Tenant list with plan/trial state (`trialing` + days left, `pro`, `free`), Stripe subscription status — this is how the founder knows who's about to be charged, who churned to Free, and where to focus support/sales attention. Essential to run the business solo from day one.
- **[V1.5]** Impersonation-for-support, AI usage/cost-per-tenant monitoring, global analytics dashboards — useful, but a handful of early customers can be tracked by directly querying Supabase; build the dashboard once there are enough tenants that manual tracking breaks down.

---

## 5. Pricing & Packaging

| | **7-day Trial** | **Pro — £97/month** | **Free (post-trial, downgraded)** |
|---|---|---|---|
| Card required | ✅ Yes, at signup | (continues from trial) | No |
| Quote funnel, wizard, order/messaging | ✅ Full | ✅ Full | ✅ (branded) |
| Branding | Own branding during trial | ✅ Fully white-labeled | "Powered by QuoteHaul", not removable |
| Lead cap | Unlimited | Unlimited | Capped (e.g. 20/mo) |
| Kanban leads board | ✅ | ✅ | ✅ |
| Human-confirmation workflow | ✅ | ✅ | ✅ |
| AI: lead scoring & follow-up | ✅ | ✅ | — |
| Custom domain | ✅ | ✅ | — (subdomain only) |
| SMS notifications | ✅ | ✅ | — |
| Capacity/calendar, invoicing, AI content-gen, AI chat | V1.5 — not in initial launch for any tier | | |

- **No forever-free signup path** — every new tenant starts on the 7-day trial, card required. This is the reversal from the earlier freemium draft (see §1 for the reasoning).
- **Downgrade, not deletion** — a non-converting trial becomes the branded Free tier automatically, preserving the long-term branding-lock/reactivation value without the open-ended cost of unlimited free accounts.
- **Single paid tier** — one clear conversion event (trial → Pro), no multi-tier ladder to explain.

---

## 6. Technical Architecture

Extends the existing stack rather than rearchitecting:

- **Frontend:** Next.js App Router (existing), shadcn/ui component set, **dnd-kit** for the Kanban board, shared atomic component library (§4.7).
- **Email:** **React Email**, rendering through the existing Resend integration.
- **Billing:** **Stripe Billing (Subscriptions)** for the platform's own £97/mo charge — trial period, webhooks driving `tenants.plan`, distinct from Stripe Connect. This is core V1 infrastructure, built alongside signup, not after.
- **Scheduled jobs:** a cron function (Vercel Cron or Supabase scheduled function) for trial-expiry downgrade — the only background job required at V1 (Kanban automation and capacity auto-close, which would need more scheduling infrastructure, are both V1.5).
- **Multi-tenancy/domains:** existing `src/middleware.ts` hostname-routing extended with the **Vercel Domains API** for custom domains (Pro-only).
- **Database:** Supabase (existing project), extended with new tables (§7) under the same RLS-per-`tenant_id` model.
- **AI:** a single internal AI-provider interface (not hard-wired) so Gemini/OpenAI are swappable per feature by cost/quality.
- **Notifications:** existing Resend (email) and Twilio (SMS, Pro-only) integrations retained.
- **Distance/routing:** existing Google Distance Matrix integration retained.
- **Hosting:** Vercel.
- **V1.5 additions (not built at launch):** Stripe Connect (§4.5), Puck (§4.1), additional scheduled jobs for Kanban automation and capacity auto-close.

---

## 7. Data Model Changes (additive to existing schema)

Existing tables retained as-is: `plans`, `tenants`, `tenant_users`, `rate_configs`, `quotes`, `quote_notes`, `content_pages`, `faq_items`.

**V1:**
- `tenants.plan` (`trialing` | `pro` | `free`), `tenants.trial_ends_at`, `tenants.stripe_customer_id`, `tenants.stripe_subscription_id`, `tenants.custom_domain`, `tenants.domain_status`
- `lead_scores` (quote_id, score, factors, generated_at)
- `order_messages` (tenant_id, quote_id, author_type [customer/staff/system], body, attachments, reply_token, created_at) — extends/replaces `quote_notes` to support threaded messaging, `reply_token` supports inbound-email matching
- `customer_sessions` (magic-link token, quote_id, last_accessed)
- `pipeline_stages` (tenant_id, name, order, is_default) — replaces the fixed-enum status on `quotes` with a tenant-customizable stage list (no `idle_threshold_hours`/automation fields yet — those come with V1.5)

**V1.5 (added when those features ship, not at launch):**
- `capacity_resources`, `capacity_blocks`
- `stripe_accounts`, `order_payments`
- `ai_generated_content`
- `automation_rules`, plus `idle_threshold_hours` added to `pipeline_stages`

---

## 8. Non-Goals / Explicit Cut Lines

- **Network/broker mode — permanently out of scope**, not deferred. QuoteHaul is a single-tenant SaaS companies sign up for individually, not a marketplace routing leads between companies.
- **No forever-free, no-card tier** — reversed from an earlier draft; see §1. Every tenant starts on a card-required trial.
- **Capacity/calendar, invoicing/Stripe Connect, AI content-gen, AI chat, and the Puck page builder are explicitly not in the V1 launch** — all confirmed V1.5, not cut, just sequenced after real revenue exists to fund and prioritize them (see §0).
- No freeform drag-drop builder at launch (config-driven sections ship first; Puck is V1.5).
- No payment collection embedded in the customer-facing quote/booking funnel, ever — payments are a staff-triggered utility on confirmed orders only, and not V1 at all (see §4.5). Lead generation is the product's core value, not payment processing.
- No AI photo/video inventory estimation in V1 (V2+ — validated pattern, deferred for scope reasons, not feasibility).
- No crew/vehicle-specific dispatch assignment (V2+; full dispatch board is SmartMoving/Supermove territory).
- No platform-held payment balances or custom withdrawal flow — Stripe Connect destination charges handle payout directly, whenever that ships.
- No native mobile app — responsive web only.
- No multi-language support.
- No automated fixed-price booking without a human click — a permanent principle, not a V1 limitation to remove later.

---

## 9. Success Metrics

- **Trial → Pro conversion rate** — the headline growth metric now that the model is trial-gated, not freemium.
- **Free (downgraded) → Pro reactivation rate** — proves the branding-lock retention mechanic still works after a lapsed trial.
- Lead-to-booked conversion rate, reported per tenant.
- Time from lead submission to human-confirmed quote sent (target: hours, not days).
- AI follow-up engagement rate (opened/replied) — proves the single V1 AI feature's ROI directly.
- Form completion rate by wizard step (identify drop-off).
- Estimate-to-confirmed-price accuracy (tunes the pricing engine).
- Inbound email reply-parsing usage rate (signals the order/messaging feature is genuinely reducing "log into the portal" friction).
- Monthly churn under 5% (Pro tier).

---

## 10. Rollout Plan

**V1 — build order:**
1. **Design system foundation:** shared atomic component library + React Email — done first since almost everything else consumes it.
2. **Branding-lock plumbing:** the centralized `getTenantBranding` helper (§3.1), wired through every page/email template as they're built, not retrofitted.
3. **Trial & subscription billing (Stripe Billing):** signup-with-card, trial state, webhooks, downgrade cron — this gates the whole product, so it needs to exist before "launch" means anything.
4. **Order/messaging core:** schema-driven Project data panel, threaded messages, magic-link order page, inbound-email reply parsing.
5. **Kanban board** (no automation): shadcn/ui + dnd-kit, customizable pipeline stages.
6. **AI lead scoring + follow-up drafting** (single AI feature, manual send).
7. **Custom domains** via Vercel Domains API.
8. **Pilot** with 2–3 real companies on the actual trial flow (including the card charge at day 7) before public launch.
9. **Public launch.**

**V1.5 — immediate fast-follow, funded by early revenue, roughly in this order:** capacity/calendar → Kanban automation rules → invoicing/Stripe Connect → AI onboarding content generation → AI chat concierge → Puck page builder. Sequence adjusts based on what paying customers actually ask for first.

---

## 11. Roadmap Notes (V2+, no committed date)

- AI photo/video inventory estimation (Yembo-style) once volume/accuracy data from V1/V1.5 usage justifies the engineering cost.
- Crew/vehicle-level dispatch assignment if the product needs to compete more directly with dispatch-first CRMs.
- Deposit/refund/chargeback handling UI once invoicing (V1.5) has real usage to design against.
- A per-transaction platform fee via the `application_fee_amount` plumbing, if a monetization lever beyond the flat £97/mo is ever wanted.
