# QuoteHaul

Multi-tenant instant-quote & lead system for removal companies, built on Next.js (App Router) + Supabase.

## What's built

- Multi-tenant DB schema in Supabase (`quotehaul` project, region eu-west-2) with RLS: `plans`, `tenants`, `tenant_users`, `rate_configs`, `quotes`, `quote_notes`, `content_pages`, `faq_items`.
- Free vs Paid plan feature flags (lead cap, SMS, saved-quote retrieval, content pages, human-confirmation workflow, custom branding/badge removal, staff accounts, analytics).
- Public multi-step quote funnel at `/[tenant]` → `/[tenant]/quote` (postcodes → date → property size → instant estimate → contact details → confirmation), with saved-quote retrieval at `/[tenant]/retrieve` and FAQ/checklist pages (paid tier).
- Tenant signup (`/signup`) and login (`/login`) using Supabase Auth (email/password).
- Tenant dashboard (`/dashboard`) with lead pipeline (new → pending confirmation → confirmed → sent → booked/lost), the human-confirmation workflow (staff reviews and confirms the exact price before it's sent), notes, and a settings page for branding/pricing.
- Real integration code for Google Distance Matrix (distance/geocoding), Resend (email), and Twilio (SMS) — all gracefully fall back to stub/log behavior if their API keys aren't set, so the app runs end-to-end without them.
- Verified: `npm run build` succeeds, `tsc --noEmit` is clean, and a production server smoke-test returned 200 on the homepage/signup and a correct 404 for an unknown tenant slug.

## Not yet done

- Privacy/terms page templates (FAQ + checklist are built; privacy/terms are the remaining content pages from the PRD).
- Live deployment to Vercel (needs a Vercel token — see below).
- Onboarding wizard UI polish (rate config beyond mile-rate/minimum/radius is set to sensible defaults in the DB and editable directly in Supabase for now; a full per-room/surcharge editor UI is a fast follow-up, not a rebuild).
- Stripe billing (out of scope for v1 per the PRD — plan is currently set manually at signup).

## Setup

1. Copy `.env.example` to `.env.local` and fill in:

   | Variable | Where to get it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ifrcndldjwsdziqyxlbf.supabase.co` (already provisioned) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` secret (never expose client-side) |
   | `GOOGLE_MAPS_API_KEY` | Google Cloud Console, with Distance Matrix API + Geocoding API enabled |
   | `RESEND_API_KEY` | resend.com dashboard |
   | `RESEND_FROM_EMAIL` | defaults to `onboarding@resend.dev` (no domain verification needed for testing) |
   | `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | Twilio console |

2. Install dependencies and run:

   ```
   npm install
   npm run dev
   ```

3. Try it: create a company at `/signup`, then visit `/<your-company-slug>/quote` to run through the funnel as a customer, and `/dashboard` to see the lead land and confirm its price.

## Deploying

The app is a standard Next.js app — deploys to Vercel with `vercel --prod` (or via the Vercel dashboard/GitHub integration) once the environment variables above are set in the Vercel project settings.

## Notes on the "100 leads/day" goal

This app is built to convert well once someone lands on the funnel (fast multi-step form, honest "guide, confirmed by a person" framing, trust badges — the pattern proven by belfasthouseremovals.co.uk). Getting 100 leads/day is a traffic/marketing outcome, not something the codebase alone delivers — it depends on paid ads, SEO, or partnerships driving visitors to each tenant's `/[tenant]/quote` page. The FAQ/checklist content pages are there to help with SEO, but volume traffic is a separate workstream from this build.
