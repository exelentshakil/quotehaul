# PRD v3: QuoteHaul — Branded SaaS for Removal Companies

**Model:** Single-tenant SaaS, one isolated account per removal company. Freemium growth loop: forever-free branded tier → **£97/month Pro** removes branding and unlocks the full product.
**Status:** Supersedes `PRD-RemovalQuote-App.md` (v1) and the first draft of this document (v2). v1's MVP (this repo) is the foundation being extended, not replaced.
**References:**
- Belfast House Removals (belfasthouseremovals.co.uk) — proves the "instant estimate + human confirms every quote" funnel converts.
- **Wayfront** (the client-portal SaaS behind the "Wayfront alternative for movers" framing this product started from) — observed live via a real customer (TheITIN's ITIN-application portal): order-centric dashboard, schema-driven order detail view, threaded in-order messaging with file attachments and reply-by-email, and persistent "Powered by Wayfront" branding even on a paying account's public footer. This is the concrete UX pattern this PRD builds toward for order/quote management and the freemium branding lock.

---

## 1. Executive Summary & Positioning

Removal companies today either quote by phone (slow, loses jobs to whoever answers first) or use a moving-specific CRM (SmartMoving, Supermove, MoversTech, Moveware) that covers dispatch/ops breadth but treats the *quoting funnel itself* as an afterthought — a plain form, not a conversion engine, and none of them turn "a real person confirms every AI-assisted quote" into a first-class, trust-building workflow. That's the wedge this product is built around, the same mechanic that makes Belfast House Removals' own funnel work.

**QuoteHaul is not "a form builder for movers."** It's the full front-of-house + back-office operating system for a removal business: the branded funnel that wins the lead, the Kanban board that stops leads from dying in an inbox, the order/messaging experience that makes the company look like a real operation (not a one-man band answering texts), the AI that scores and nurtures leads without headcount, the calendar that stops double-booking a truck, and payment collection that doesn't need a separate invoicing tool bolted on. That bundle — not any single feature — is what justifies £97/month.

**One buyer, one product, no marketplace:** every signup is a single removal company running its own fully isolated instance. There is no lead-matching or broker layer between companies — each company owns 100% of its own leads and data, full stop. (An earlier draft of this PRD explored a multi-mover "network/broker" mode inspired by Belfast House Removals' own business model; that has been deliberately dropped — see §8 — in favor of a simpler, faster-to-ship, more clearly-scoped single-tenant SaaS.)

**Growth model: freemium with a branding lock, not a time-limited trial.** Anyone can sign up free, forever, no card required, and run a fully working quote funnel and dashboard — but every public page and every email is stamped "Powered by QuoteHaul" and can't be changed, and the highest-leverage features (AI, payments, custom domain, SMS) are Pro-only. This is the same growth loop Crisp and other bottom-up SaaS tools use: get them live and using it fast, let the product sell itself, and let wanting to look independently branded (plus wanting the AI/payments/domain features they've seen work) pull them into £97/mo. It converts better than a countdown trial because there's no artificial urgency — the urgency is "customers are seeing our competitor's logo on my quote emails."

**Why £97/mo is defensible once they're hooked:**
- Removing the branding lock, alone, is a strong lever for any company that cares how they look to customers.
- Beyond that, it replaces a $19–59/mo CRM seat *and* a payment processor *and* a copywriter for FAQ/ad content *and* an admin doing manual lead follow-up — bundled, AI-accelerated, and specific to this industry's quirks (sea crossings, stairs, volume bands) instead of generic field-service software.
- The value story is measurable: leads converted, hours of admin saved, money collected without manual invoicing — a P&L line, not just "a tool."

---

## 2. Personas & Buyer Psychology

### 2.1 Company Owner / Office Manager (the buyer)
Not technical. Currently loses leads to slow response times and runs pricing "in their head" or on a spreadsheet. Wants to look as professional as a national brand without hiring a web agency. Signs up free because there's no reason not to; upgrades once the branding starts to bother them or once they've seen the AI/payments/Kanban features do real work and want the rest unlocked. Price-sensitive but will pay for something that visibly converts and removes admin work — not for "features" in the abstract.

### 2.2 End Customer (the person moving house)
Wants a price fast, doesn't want to ring five companies, doesn't fully trust an instant online number, wants to know a human will check it before anything's final, and wants an easy way to find their quote again if they don't book immediately. Never wants to create an account for a one-time transaction. Once a quote becomes a real order, they expect to see it treated like one: a clear status, a place to ask questions and get replies (ideally without having to log into yet another portal — email should just work), and confidence someone's actually looking at their move. This is exactly the order/messaging experience observed in the Wayfront/TheITIN reference (§4.1).

### 2.3 Platform Admin (superadmin — you)
Needs to see and manage every tenant, plan, and payment flow from one place: who's on free vs Pro, whose Stripe Connect account isn't verified yet, whose usage looks like a churn risk or a strong upgrade candidate, and global AI-cost/usage monitoring (since AI features carry marginal cost per tenant and must not erode margin on a flat £97/mo price).

---

## 3. Business Model & Tenancy Architecture

### 3.1 Tenancy model
The existing schema already has `tenants`, `tenant_users`, `rate_configs`, `quotes`, `content_pages`, `faq_items` under Supabase RLS — this stays the backbone, unchanged in shape. Each row in `tenants` is one independent company, full stop — no parent/child tenant relationships, no shared-lead constructs.

- **`tenants.plan`**: `free` | `pro`. This single field is the entire tenancy/feature-gating model. No separate "mode" concept is needed since there's no network/broker configuration to switch on.
- **Branding-lock enforcement is a single, centralized check**, not scattered conditionals: one server-side helper (e.g. `getTenantBranding(tenant)`) that every public page render and every email template calls, which forces the platform logo/footer/"Powered by QuoteHaul" whenever `plan === 'free'`, and returns the tenant's own branding when `plan === 'pro'`. Every new page or email template must route through this helper — this is the one piece of plumbing that makes the freemium lever actually work everywhere, consistently, without hunting down every place branding is rendered.

### 3.2 Data isolation
Existing Supabase RLS-per-`tenant_id` pattern is the isolation boundary, unchanged. No new isolation model needed — this PRD removes complexity here (no `mover_id`-scoped tables) rather than adding to it.

---

## 4. Full Feature Set

Each feature below is tagged **[MVP]** (build now, ships at launch on both Free and Pro unless noted "Pro-only") or **[v1.5/v2]** (explicit fast-follow, not required to sell day one).

### 4.1 Public Quote Funnel & Order/Messaging Experience

- **[MVP] Config-driven landing page.** Company edits structured settings via dashboard forms — logo, color scheme, hero copy, which trust badges show, FAQ content, section order/visibility. On Free, all of this works except the platform-branding footer/watermark can't be removed. This ships first because it's cheap and unblocks launch.
- **[v1.5] Drag-drop page builder via Puck** (puckeditor.com — open-source, MIT-licensed, React-native visual editor built specifically for Next.js). Rather than licensing an expensive proprietary embed (Unlayer/Beefree) or building an editor from scratch, Puck lets the *existing* atomic component library (§4.7) be registered directly as draggable blocks — a company gets true layout freedom (reorder, add, remove sections visually) without a second design system to maintain. This is a genuine differentiator ("Framer for movers," specific to this industry's trust badges/FAQ/checklist content) worth building, but it's a fast-follow, not launch-blocking: config-driven sections already close the sale, and Puck integration can ship weeks after launch once the component library it binds to has stabilized under real usage.
- **[MVP] Multi-step wizard** (postcodes → date → property size/inventory → instant estimate → contact details → confirmation) — already built in v1, kept as-is; validated by Belfast House Removals' live conversion funnel.
- **[MVP] Instant estimate engine** — distance (Google Distance Matrix, already integrated) + volume/room bands + rate card + modifiers (stairs, packing, weekend, sea crossing/long-distance), returned as a range, explicitly labeled as a guide.
- **[MVP] Order/quote detail experience — built now, to the full Wayfront-observed pattern, not a lighter placeholder:**
  - A **schema-driven "Project data" panel**: whatever fields the customer filled in on the intake wizard are rendered read-only as labeled rows on the order. The same field-schema definition drives both the wizard *and* this summary view, so adding a new intake question automatically produces a new summary row with no duplicated template work.
  - A **threaded message panel** on every order — rich text, drag-and-drop file attachments, CC — visible to both the customer (via their magic-link order page) and staff (inside the dashboard's order view). This is a single shared conversation, not two separate views of different data.
  - **Inbound email reply parsing.** Every new thread message triggers a branded "Order updated" notification email containing a hidden per-order/per-message reply token (`{#ORDER-<id>-<hash>#}` style, "reply above this line" convention). A reply to that email is received via an inbound-email webhook, matched by token, and posted back into the thread automatically — so the customer never has to visit the portal to keep the conversation going. This is the single most-praised mechanic in the reference product and is treated as core, not optional polish.
  - **Magic-link access, no login** — the customer's link is the existing saved-quote token, extended to show live status (draft estimate → confirmed → booked) plus the Project data panel and message thread described above.
- **[v1.5] AI chat concierge** embedded in the funnel widget — conversational alternative to the static form. Cheap/fast model (Gemini Flash or GPT-4o-mini); not required to convert leads (the wizard already converts) but a strong demo/ad differentiator.
- **[v2] AI photo/video inventory estimation** (Yembo-style) — customer uploads photos or a short video walkthrough; AI estimates volume/item list. Validated as a real industry pattern by Yembo, but a materially heavier lift (vision API calls, review UI, poor-footage edge cases) — explicitly not in v1.

### 4.2 Leads / CRM — Kanban Board

- **[MVP] Jira/Trello-style Kanban board** as the primary lead-management surface, built with **shadcn/ui + dnd-kit** (standard low-token, accessible pattern for Next.js — keyboard-operable drag-and-drop for WCAG compliance, column/card state synced to Supabase via server actions after each drag).
- **[MVP] Pipeline stages**, company-customizable beyond the default (new → estimate sent → pending confirmation → confirmed → booked → lost) — rename/add/reorder columns.
- **[MVP] Card detail**: full quote data, notes/message thread (shared with §4.1's order messaging — one thread, one source of truth), one-click call/email/SMS actions, AI lead score badge, linked capacity/booking once confirmed.
- **[MVP] Filters & search** by status, date range, value, source, assigned staff member.
- **[MVP] SLA/aging indicators** on cards — flags leads sitting too long in a stage so nothing silently dies.
- **[MVP] Automation rules** (pulled forward from the original v1.5 plan — confirmed cheap to add since it's a thin rules layer over the AI follow-up feature that's already in MVP scope, §4.6): "if a lead sits in 'estimate sent' for 24h, auto-send the AI-drafted follow-up and notify staff." Company can adjust the idle-time threshold per stage.

### 4.3 Human-Confirmation Workflow

- **[MVP] Kept and extended, not replaced.** This is the trust mechanic that differentiates the product from every "instant fixed price" competitor. Staff reviews the AI/rate-card-generated estimate, adjusts for real capacity/rates, and confirms the exact price before it's sent — the v1 workflow, now living as a lane on the Kanban board.
- **[MVP]** AI lead score and suggested-price nudge shown alongside the human review screen (AI assists, never auto-sends without a human click — a permanent principle, not a v1 limitation).

### 4.4 Capacity & Calendar **(Pro-only)**

- **[MVP] Resource-based capacity.** Company defines resources (e.g. "3 vans," "2 crews of 3") with a daily crew-hour capacity. Each confirmed booking consumes crew-hours against that day; the day auto-closes to new bookings once full.
- **[MVP] Manual override always wins** — owner can force-block a date/resource or force-open a day past computed capacity regardless of the automatic math. Chosen deliberately over pure-automatic or pure-manual: automation a non-technical owner doesn't trust gets ignored, and pure-manual blocking wastes data the system already has — the override escape hatch is what makes the automation trustworthy.
- **[MVP]** Calendar view surfaces both computed availability and manual blocks with a clear visual distinction.
- **[v1.5]** Crew/vehicle assignment per booking (specific van/crew, not just aggregate capacity) — full dispatch-board territory, deliberately deferred (overlaps with SmartMoving/Supermove's specialty, not needed to win the sale).

### 4.5 Invoicing & Deposit Collection **(Pro-only, optional utility — not part of the core funnel)**

**Reframed from the original "checkout at booking" design.** Moving is not a prepay-then-fulfill business like e-commerce — customers expect to pay on move day or after inspection, not at the moment a quote is confirmed. Forcing payment collection into the lead funnel would work against the product's actual job, which is winning and converting leads. Payments here are a **staff-triggered convenience feature layered on top of an already-confirmed order**, matching how Wayfront itself treats it (a separate "Invoices" area, not a checkout step baked into onboarding a new client) — never a blocking step for the customer.

- **[MVP] Stripe Connect (Standard/Express) onboarding** per tenant — Stripe's hosted onboarding flow collects KYC so the platform never has to. Entirely optional: a tenant who never connects Stripe loses nothing from the core lead-gen/Kanban/messaging product.
- **[MVP] "Request payment" action on an order** — staff picks an amount (a deposit to hold the booking, or the final balance once the job's done) and QuoteHaul generates a Stripe Payment Link / Checkout Session and drops it into the order's message thread (§4.1) and a notification email. The customer pays on their own time via Stripe's hosted page; nothing about the quote/booking flow requires payment to proceed.
- **[MVP] Destination charges.** The charge is created with `transfer_data[destination]` set to the tenant's connected Stripe account, so funds land directly in *their* Stripe balance at charge time — not a platform-held balance. Stripe's own payout schedule (2–7 days, standard) moves it to their bank automatically. **No custom ledger, no withdrawal button, no held-balance UI to build.**
- **[MVP]** `application_fee_amount` support is left wired into the charge-creation code path at 0% by default — the plumbing costs nothing to include now, and gives a ready lever for a future per-transaction platform fee if ever wanted, without needing to touch the payment integration again.
- **[MVP]** Simple per-order payment record (amount, status, Stripe payment/transfer IDs) surfaced on the order detail view — not a full accounting ledger, just enough for the company to see what was requested/paid.
- **[v2]** Deposit-vs-balance split payments, refund workflows, dispute/chargeback handling UI (Stripe handles the mechanics; this is just surfacing it well in-dashboard).

### 4.6 AI Features (priority order, as decided) **(Pro-only)**

1. **[MVP] Lead scoring + AI-drafted follow-up copy.** Every lead gets a score (completeness, move size/value, response latency, distance/date fit to capacity) and, for stalled leads, an AI-drafted follow-up email/SMS staff can send with one click or edit first — and, per §4.2, can now be auto-sent via a Kanban automation rule. Highest-ROI AI feature: measured in *jobs won from leads already paid for*.
2. **[MVP] AI onboarding content generation.** At signup, AI drafts the company's FAQ, checklist/SEO page, and starter ad copy for Facebook/Google from a handful of inputs. Best live-demo moment for sales calls; collapses onboarding from hours to minutes.
3. **[MVP] AI chat concierge on the funnel** — see §4.1.
4. **[v1.5/v2] AI photo/video inventory estimation** — see §4.1.

**Provider abstraction:** all AI calls go through a single internal interface (not hard-wired to one vendor) so Gemini and OpenAI models are swappable per feature by cost/quality — e.g. Gemini Flash or GPT-4o-mini for chat/follow-up drafting, a stronger model reserved only where quality genuinely matters (content generation shown directly to the company as their brand voice).

### 4.7 Shared Design System (Atomic UI + Email)

- **[MVP] One shared atomic-design component library** — atoms (`StatusBadge`, `Avatar`, `IconButton`), molecules (`StatCard`, `FileChip`, `MessageBubble`), organisms (`OrderHeader`, `MessageThread`, `ProjectDataPanel`, `KanbanCard`) — used consistently across the public funnel, the customer's magic-link order page, and the staff dashboard.
- **[MVP] React Email for every transactional email** (order-updated notifications, lead confirmation, quote-ready, follow-up drafts), built on the existing Resend dependency already in `package.json`. Email templates reuse the same design tokens (colors, spacing, type) as the web components — not a visually identical component library, since email HTML has real rendering constraints, but the same *tokens and patterns* (e.g. the same `StatusBadge` color logic rendered as an email-safe pill) so every page and every email look like the same product.
- **Why this matters for maintainability:** this is the direct answer to "every page and email should look great, easy to manage, low token/time to finish" — a change to how a status pill looks or how a message bubble is styled is one component edit, not a hunt through a dozen page templates and email HTML files.

### 4.8 Branding & Custom Domains **(custom domain is Pro-only; subdomain is free)**

- **[MVP] Subdomain per tenant** (`companyA.ourdomain.com`) working out of the box at signup on both Free and Pro — no manual DNS step required.
- **[MVP] Custom domain support (Pro-only)** via the **Vercel Domains API** — programmatic assignment of custom domains with automatic SSL, following the pattern of Vercel's own Platforms Starter Kit (hostname-based middleware routing, already partially present in this repo's `src/middleware.ts`).
- **[MVP]** Theme/config system: logo, color scheme, typography choice (constrained palette, not freeform), phone number — persisted per tenant, rendered consistently everywhere via the branding-lock helper in §3.1.

### 4.9 Admin / Superadmin

- **[MVP]** Tenant list with plan/status (free, pro, past-due), impersonation-for-support capability, global lead/revenue analytics, free→paid conversion tracking.
- **[MVP]** AI usage/cost monitoring per tenant (protects margin on the flat £97/mo Pro price).
- **[MVP]** Stripe Connect account status per tenant (verified/pending/restricted) surfaced clearly, since an unverified Connect account blocks a tenant's ability to collect payment.

---

## 5. Pricing & Packaging

| | **Free (forever, no card)** | **Pro — £97/month** |
|---|---|---|
| Quote funnel & wizard | ✅ (config-driven, own copy/colors) | ✅ Same, fully customizable |
| Branding | "Powered by QuoteHaul" on every public page & email, **not removable** | ✅ Fully white-labeled — your name, your look, nowhere does QuoteHaul appear |
| Lead cap | Capped per month (e.g. 20/mo) | Unlimited |
| Kanban leads board | ✅ Full board, custom stages, automation rules | ✅ Same |
| Order detail + messaging + reply-by-email | ✅ | ✅ Same |
| Human-confirmation workflow | ✅ | ✅ Same |
| Capacity/calendar | — | ✅ Resource-based + manual override |
| Invoicing & deposit requests (Stripe Connect) | — | ✅ |
| AI: lead scoring & follow-up (incl. automation) | — | ✅ |
| AI: onboarding content generation | — | ✅ |
| AI: chat concierge | — | ✅ |
| Custom domain | — (subdomain only) | ✅ |
| SMS notifications | — | ✅ |

- **No time-limited trial** — Free is permanent, not a countdown. The upgrade pressure comes from wanting the branding removed and wanting the AI/payments/capacity features they can see exist, not from an expiry date.
- **No card required to sign up** — removes all top-of-funnel friction for ad/demo-driven signups; the branding lock does the conversion work over time instead.
- **Single paid tier** — deliberately simpler than the original three-tier idea (Lite/Pro/Network): there's no network mode left to gate behind a higher tier, so one clear upgrade (Free → Pro) is the entire pricing story.

---

## 6. Technical Architecture

Extends the existing stack rather than rearchitecting (confirmed decision — the current Next.js 15 App Router + Supabase RLS + Google Distance Matrix + Resend + Twilio foundation is sound for this scope, and is now a *smaller* delta than the original v2 draft since network mode and the held-balance payment ledger are both removed):

- **Frontend:** Next.js App Router (existing), shadcn/ui component set (already Radix-based in `package.json`), **dnd-kit** added for the Kanban board, shared atomic component library (§4.7).
- **Email:** **React Email** added, rendering through the existing Resend integration — shared design tokens with the web component library.
- **Multi-tenancy/domains:** existing `src/middleware.ts` hostname-routing extended with the **Vercel Domains API** for programmatic custom-domain + SSL assignment (Pro-only), following the Platforms Starter Kit pattern.
- **Database:** Supabase (existing project), extended with new tables (§7) under the same RLS-per-`tenant_id` model — no new isolation dimension needed.
- **Payments:** Stripe Connect (Standard/Express) via Stripe's Node SDK (already a dependency) — destination charges via staff-triggered Payment Links/Checkout Sessions (not embedded in the customer funnel), no custom transfer/withdrawal logic to build.
- **Visual page builder (v1.5):** Puck (`@measured/puck`, MIT-licensed) registers the shared component library (§4.7) as editable blocks — no separate rendering engine to maintain alongside the component system.
- **Inbound email:** a webhook endpoint (Resend inbound, or a dedicated inbound-parse provider if Resend's inbound support doesn't fit) that receives replies, matches the hidden order/message token, and appends to the relevant thread.
- **AI:** a single internal AI-provider interface (not hard-wired) so Gemini and OpenAI models can be selected per feature by cost/quality.
- **Notifications:** existing Resend (email) and Twilio (SMS, Pro-only) integrations retained.
- **Distance/routing:** existing Google Distance Matrix integration retained.
- **Hosting:** Vercel (already the target; domains work depends on it).

---

## 7. Data Model Changes (additive to existing schema)

Existing tables retained as-is: `plans`, `tenants`, `tenant_users`, `rate_configs`, `quotes`, `quote_notes`, `content_pages`, `faq_items`.

New/changed (simplified vs the original v2 draft — no network/mover-scoped tables):
- `tenants.plan` (`free` | `pro`), `tenants.custom_domain`, `tenants.domain_status`
- `capacity_resources` (tenant_id, resource_name, crew_hours_per_day)
- `capacity_blocks` (tenant_id, resource_id, date/time range, manual_override boolean)
- `stripe_accounts` (tenant_id, stripe_account_id, status, payout schedule)
- `order_payments` (tenant_id, quote_id, amount, application_fee_amount default 0, status, stripe payment/transfer IDs)
- `lead_scores` (quote_id, score, factors, generated_at)
- `ai_generated_content` (tenant_id, type [faq/checklist/ad_copy/follow_up], content, model_used, created_at)
- `order_messages` (tenant_id, quote_id, author_type [customer/staff/system], body, attachments, reply_token, created_at) — extends/replaces `quote_notes` to support the shared threaded messaging in §4.1/§4.2, with `reply_token` supporting inbound-email matching
- `customer_sessions` (magic-link token, quote_id, last_accessed) — extends the existing saved-quote token mechanism for the order/messaging page
- Kanban board config: `pipeline_stages` (tenant_id, name, order, idle_threshold_hours, is_default) — replaces the fixed-enum status on `quotes` with a tenant-customizable, automation-aware stage list
- `automation_rules` (tenant_id, pipeline_stage_id, trigger [idle_time], action [ai_followup], threshold_hours, enabled)

---

## 8. Non-Goals / Explicit Cut Lines

- **Network/broker mode — permanently out of scope for this product, not deferred.** An earlier draft explored a multi-mover matching/broker configuration inspired by Belfast House Removals' own business (one operator, many fulfilling movers). The user explicitly corrected this: QuoteHaul is a single-tenant SaaS companies sign up for individually, not a marketplace that routes leads between companies. This isn't a v1.5/v2 item — it's not part of the product's direction at all.
- No freeform drag-drop page builder **in the launch scope specifically** — config-driven sections ship first and close the sale; a Puck-based visual builder is a confirmed v1.5 fast-follow, not a "maybe someday" (see §4.1).
- No payment collection embedded in the customer-facing quote/booking funnel — moving is paid on move-day/after-inspection, not prepaid like e-commerce; payments are a staff-triggered utility on confirmed orders only (see §4.5). The product's core value is lead generation, not payment processing.
- No AI photo/video inventory estimation in v1 (v1.5/v2 — validated pattern, deferred for scope reasons, not feasibility).
- No crew/vehicle-specific dispatch assignment (aggregate capacity only; full dispatch board is competitor SmartMoving/Supermove territory, not needed to win this sale).
- No platform-held payment balances or custom withdrawal flow — Stripe Connect destination charges handle payout directly (see §4.5); this was explicitly simplified away once network mode (its main justification) was removed.
- No native mobile app — responsive web only.
- No multi-language support.
- No automated fixed-price booking without a human click — this is a permanent principle, not a v1 limitation to remove later.

---

## 9. Success Metrics

- **Free → Pro conversion rate** — the headline growth metric for a freemium/branding-lock model; tracked alongside *why* tenants upgrade (branding vs. specific feature) via an upgrade-flow prompt.
- Lead-to-booked conversion rate, reported per tenant.
- Time from lead submission to human-confirmed quote sent (target: hours, not days).
- AI follow-up engagement rate (opened/replied), including the automated-rule-triggered follow-ups specifically — proves the highest-priority AI feature's ROI directly.
- Form completion rate by wizard step (identify drop-off).
- Estimate-to-confirmed-price accuracy (tunes the pricing engine).
- Payment volume processed via Stripe Connect (proves the payments feature is actually being used, not just enabled).
- Inbound email reply-parsing usage rate (signals the order/messaging feature is genuinely reducing "log into the portal" friction, the specific thing praised in the Wayfront reference).
- Monthly churn under 5% (Pro tier).

---

## 10. Rollout Plan

1. **Design system foundation:** shared atomic component library + React Email setup — done early since almost everything else (funnel, dashboard, Kanban, order view, emails) consumes it.
2. **Order/messaging core:** schema-driven Project data panel, threaded messages, magic-link order page, and inbound-email reply parsing — built early and fully, not as a later add-on, since it's now core to both the free and paid experience and the reference feature the user validated firsthand.
3. **Kanban board:** shadcn/ui + dnd-kit board replacing the current list-based lead view; customizable pipeline stages; automation rules.
4. **Capacity & calendar (Pro):** resource-based capacity + manual override, wired into the confirmation workflow.
5. **Invoicing & deposit collection (Pro):** Stripe Connect onboarding + staff-triggered "Request payment" Payment Links on confirmed orders — deliberately not part of the customer funnel.
6. **AI (Pro), in priority order:** lead scoring/follow-up (+ Kanban automation hookup) → onboarding content generation → chat concierge.
7. **Domains (Pro):** Vercel Domains API integration for custom domains (subdomain already works free).
8. **Branding-lock plumbing:** the centralized `getTenantBranding` helper (§3.1) wired through every page and email template — do this alongside step 1, not as an afterthought, since retrofitting branding checks into already-built pages is exactly the kind of rework this PRD is trying to avoid.
9. **Pilot** with 3–5 real companies before public launch — validate free-tier conversion pressure, order/messaging engagement, AI follow-up engagement, and Stripe destination-charge payout, since these are the newest and highest-value pieces.
10. **Public launch**: free signup, no card, leaning on the same trust-first funnel structure (instant estimate hero, trust badges, three-step "how it works," FAQ, persistent phone number) proven by Belfast House Removals and carried over from v1.
11. **Immediate fast-follow (v1.5, not a "someday"):** Puck-based visual page builder (§4.1) wired to the already-launched component library.

---

## 11. Roadmap Notes (beyond v1)

- AI photo/video inventory estimation (Yembo-style) once volume/accuracy data from v1 usage justifies the engineering cost.
- Crew/vehicle-level dispatch assignment if the product needs to compete more directly with dispatch-first CRMs.
- A per-transaction platform fee via the `application_fee_amount` plumbing already wired in (§4.5), if a future monetization lever beyond the flat £97/mo is ever wanted.
