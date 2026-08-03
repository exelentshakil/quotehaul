# API credentials still needed

The app is live but running on fallbacks: distance defaults to a flat 12-mile estimate, and emails/SMS just log to the server console instead of sending. Add these to turn each one on.

## 1. Google Maps (real distance/estimates)

- Go to console.cloud.google.com → create/select a project → APIs & Services → Library.
- Enable **Distance Matrix API** and **Geocoding API**.
- APIs & Services → Credentials → Create API key. Restrict it to those two APIs.
- Env var: `GOOGLE_MAPS_API_KEY`

## 2. Resend (email receipts + notifications)

- Sign up at resend.com → API Keys → create one.
- Env var: `RESEND_API_KEY`
- Env var: `RESEND_FROM_EMAIL` — leave as `onboarding@resend.dev` for now (works with no setup), or verify your own domain in Resend later and switch to `you@yourdomain.com`.

## 3. Twilio (SMS — optional, paid-tier feature)

- console.twilio.com → get your Account SID and Auth Token from the dashboard.
- Buy/use a Twilio phone number capable of SMS.
- Env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

## 4. Stripe (billing)

Already partly done: I created the **QuoteHaul Paid** product (£97/mo GBP, test mode) in your connected Stripe account — price ID `price_1U0PdK2Q3tI22Tbxtm8vzebk` is already the default in the code. Two things left for you:

- Env var: `STRIPE_SECRET_KEY` — dashboard.stripe.com → Developers → API keys → Secret key (starts `sk_test_...` while in test mode, `sk_live_...` once you switch the account to live).
- Env var: `STRIPE_WEBHOOK_SECRET` — once your app has a real URL, go to Developers → Webhooks → Add endpoint → URL `https://<your-domain>/api/stripe/webhook` → select events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` → copy the signing secret shown (starts `whsec_...`).

Tell me your live URL and I can register that webhook endpoint for you directly via Stripe's MCP instead of you doing it by hand.

Test mode note: everything's in Stripe test mode right now (safe, no real charges). Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC, to try the upgrade flow end-to-end before going live.

## Adding them

**Locally:** paste into `.env.local` (copy from `.env.example` if you don't have one yet), then `npm run dev`.

**On Vercel (production):** either the dashboard — Project → Settings → Environment Variables — or the CLI:

```
npx vercel env add GOOGLE_MAPS_API_KEY production
npx vercel env add RESEND_API_KEY production
npx vercel env add RESEND_FROM_EMAIL production
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production
npx vercel env add TWILIO_FROM_NUMBER production
```

Then redeploy: `npx vercel --prod` (env vars only take effect on the next deploy).

`deploy.sh` already has commented-out lines for all of these near the bottom — uncomment and fill them in, then rerun the script, if you'd rather do it in one shot.
