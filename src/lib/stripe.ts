import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// The Stripe Price ID for the £97/mo Paid plan.
// Created via Stripe: product "QuoteHaul Paid", price price_1U0PdK2Q3tI22Tbxtm8vzebk (test mode).
export const PAID_PLAN_PRICE_ID = process.env.STRIPE_PAID_PRICE_ID || "price_1U0PdK2Q3tI22Tbxtm8vzebk";
