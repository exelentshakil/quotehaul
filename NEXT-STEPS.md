# Next steps

## 1. Get it into GitHub → Vercel auto-deploy

```
cd quotehaul
rm -f .git/index.lock        # stale lock left by my sandbox, harmless to remove
git add .
git commit -m "QuoteHaul: Stripe billing + shadcn UI retouch"
```

Then create a new empty repo on GitHub (no README/license, so it stays empty) and push:

```
git remote add origin https://github.com/<you>/quotehaul.git
git branch -M main
git push -u origin main
```

In the Vercel dashboard: your project → Settings → Git → connect the GitHub repo. Every push to `main` now auto-deploys — no more running `vercel --prod` by hand.

## 2. Env vars still needed (see `API-SETUP.md` for full detail)

| Var | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ done |
| `STRIPE_SECRET_KEY` | ❌ needed — dashboard.stripe.com → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | ❌ needed — register `https://<your-domain>/api/stripe/webhook` in Stripe once you have a live URL; tell me the URL and I'll register it via MCP |
| `STRIPE_PAID_PRICE_ID` | ✅ already set (test-mode £97/mo price, created via Stripe MCP) |
| `GOOGLE_MAPS_API_KEY` | ❌ needed for real distance (falls back to a flat estimate without it) |
| `RESEND_API_KEY` | ❌ needed for real email (falls back to console log without it) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | ❌ needed for SMS (paid-tier feature only) |

## 3. What changed in this pass (why it's more sellable now)

- **Stripe billing**: real £97/mo subscription via Stripe Checkout, self-serve billing portal, webhook keeps the tenant's plan in sync with actual payment status. Signup no longer manually sets "paid" — only a real subscription does.
- **UI retouch**: rebuilt the marketing landing page, the tenant's public funnel, and the quote form itself with shadcn/ui components (Card, Button, Progress, Badge) on a proper design-token theme — looks like a real SaaS product now, not a bare Tailwind prototype. Each tenant's brand color still themes their whole funnel automatically (hex → CSS variable at render time).
- Confirmed clean `tsc` + `next build` + smoke test after every change in this pass.

## 4. What's still rough (be upfront with your partner about this)

- **Dashboard and settings pages** weren't retouched this pass — still the plain Tailwind version. Functional, not polished. Worth a follow-up pass before a customer (not partner) demo.
- **Onboarding wizard** is minimal — new tenants get sensible default rates, but there's no guided flow to customize per-room pricing/surcharges beyond mile-rate, minimum, and service radius. Real customers will want this before self-serve signup is viable.
- **No spam protection** on the public quote form yet (no honeypot/reCAPTCHA) — fine for a demo, not for public launch.
- **No error monitoring** (Sentry or similar) — you're flying blind on production errors right now.
- **Privacy/Terms pages** aren't built — FAQ and checklist are, privacy/terms are the remaining content-page types from the original plan.
- Everything is on **Stripe test mode** — flip the account to live mode (and swap `STRIPE_SECRET_KEY`/price ID for the live equivalents) before taking real payments.

## 5. Suggested order for the next working session

1. Add your API keys (Maps, Resend, Twilio, Stripe) and confirm the full funnel end-to-end with real notifications.
2. Spam protection on the public form (quick win, high risk if skipped).
3. Retouch dashboard + settings with the same shadcn components.
4. Real onboarding wizard for rate/surcharge configuration.
5. Error monitoring + Stripe live mode switch when you're ready to charge real customers.
