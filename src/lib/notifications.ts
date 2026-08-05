import { Resend } from "resend";
import twilio from "twilio";
import type { EmailTemplateType, Quote, Tenant } from "@/types/database";
import { fillTemplate } from "@/lib/email-templates";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

const fromEmail = () => process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// If the tenant has customized this email type in Settings, use their
// subject/body (with {{token}} substitution) instead of the hardcoded
// default — zero behavior change for tenants who never touch this.
function resolveEmail(
  tenant: Tenant,
  type: EmailTemplateType,
  tokens: Record<string, string>,
  fallback: { subject: string; html: string }
): { subject: string; html: string } {
  const override = tenant.email_templates?.[type];
  if (!override) return fallback;
  return {
    subject: fillTemplate(override.subject, tokens),
    html: `<p>${fillTemplate(override.body, tokens).replace(/\n/g, "<br/>")}</p>`,
  };
}

// Notify the removal company that a new lead came in.
export async function notifyTenantOfNewLead(tenant: Tenant, quote: Quote, tenantOwnerEmail: string | null, smsEnabled: boolean) {
  const resend = getResend();
  if (resend && tenantOwnerEmail) {
    const { subject, html } = resolveEmail(
      tenant,
      "new_lead",
      {
        company_name: tenant.company_name,
        customer_name: quote.customer_name ?? "Unknown",
        route: `${quote.from_postcode} to ${quote.to_postcode}`,
        link: `${siteUrl()}/dashboard/leads/${quote.id}`,
      },
      {
        subject: `New lead: ${quote.from_postcode} to ${quote.to_postcode}`,
        html: `<p>New quote request for <strong>${tenant.company_name}</strong>.</p>
          <p>${quote.customer_name ?? "Unknown"} — ${quote.customer_phone ?? ""} — ${quote.customer_email ?? ""}</p>
          <p>${quote.from_postcode} &rarr; ${quote.to_postcode}, moving ${quote.move_date ?? "date TBC"}</p>
          <p>Estimate: £${quote.estimate_low}&ndash;£${quote.estimate_high}</p>
          <p><a href="${siteUrl()}/dashboard/leads/${quote.id}">Review and confirm this quote</a></p>`,
      }
    );
    await resend.emails.send({ from: fromEmail(), to: tenantOwnerEmail, subject, html }).catch((err) => console.error("Resend tenant notification failed", err));
  } else {
    console.log("[notifications] (stub) would email tenant about new lead", quote.id);
  }

  if (smsEnabled) {
    const client = getTwilioClient();
    const to = tenant.branding?.phone;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (client && to && from) {
      await client.messages
        .create({ to, from, body: `New QuoteHaul lead: ${quote.from_postcode} -> ${quote.to_postcode}. Review: ${siteUrl()}/dashboard/leads/${quote.id}` })
        .catch((err) => console.error("Twilio tenant SMS failed", err));
    } else {
      console.log("[notifications] (stub) would SMS tenant about new lead", quote.id);
    }
  }
}

// Send the customer their estimate receipt + saved-quote retrieval link.
export async function sendCustomerReceipt(tenant: Tenant, quote: Quote, retrievalEnabled: boolean, smsEnabled: boolean) {
  const resend = getResend();
  const retrievalLine = retrievalEnabled
    ? `<p>You can find this quote again any time here: <a href="${siteUrl()}/${tenant.slug}/retrieve?token=${quote.token}">${siteUrl()}/${tenant.slug}/retrieve?token=${quote.token}</a></p>`
    : "";

  if (resend && quote.customer_email) {
    const { subject, html } = resolveEmail(
      tenant,
      "customer_receipt",
      {
        company_name: tenant.company_name,
        customer_name: quote.customer_name ?? "",
        estimate: `£${quote.estimate_low}–£${quote.estimate_high}`,
      },
      {
        subject: `Your moving estimate from ${tenant.company_name}`,
        html: `<p>Thanks ${quote.customer_name ?? ""} — here's your instant estimate for ${quote.from_postcode} to ${quote.to_postcode}:</p>
          <p><strong>£${quote.estimate_low}&ndash;£${quote.estimate_high}</strong> (guide only)</p>
          <p>This is a guide price. A member of the ${tenant.company_name} team will confirm your exact price shortly — free and no obligation.</p>
          ${retrievalLine}`,
      }
    );
    await resend.emails.send({ from: fromEmail(), to: quote.customer_email, subject, html }).catch((err) => console.error("Resend customer receipt failed", err));
  } else {
    console.log("[notifications] (stub) would email customer receipt", quote.id);
  }

  if (smsEnabled && quote.customer_phone) {
    const client = getTwilioClient();
    const from = process.env.TWILIO_FROM_NUMBER;
    if (client && from) {
      await client.messages
        .create({ to: quote.customer_phone, from, body: `${tenant.company_name}: your estimate is £${quote.estimate_low}-£${quote.estimate_high} (guide only). We'll confirm your exact price shortly.` })
        .catch((err) => console.error("Twilio customer SMS failed", err));
    } else {
      console.log("[notifications] (stub) would SMS customer receipt", quote.id);
    }
  }
}

// Sent when either side posts a new message on an order thread, to the other side.
export async function notifyNewMessage(tenant: Tenant, quote: Quote, from: "staff" | "customer", body: string, toEmail: string | null) {
  const resend = getResend();
  if (!resend || !toEmail) {
    console.log("[notifications] (stub) would email new order message", quote.id);
    return;
  }
  const orderUrl = from === "staff"
    ? `${siteUrl()}/${tenant.slug}/retrieve?token=${quote.token}`
    : `${siteUrl()}/dashboard/leads/${quote.id}`;
  const fromLabel = from === "staff" ? tenant.company_name : (quote.customer_name || "Your customer");
  const { subject, html } = resolveEmail(
    tenant,
    "order_message",
    { company_name: tenant.company_name, author_name: fromLabel, message: body, link: orderUrl },
    {
      subject: `Order updated – ${quote.from_postcode} to ${quote.to_postcode}`,
      html: `<p><strong>${fromLabel}</strong> sent a new message:</p>
        <blockquote style="margin:0;padding-left:12px;border-left:3px solid #e2e8f0;color:#334155">${body}</blockquote>
        <p style="margin-top:16px"><a href="${orderUrl}">View and reply</a></p>`,
    }
  );
  await resend.emails.send({ from: fromEmail(), to: toEmail, subject, html }).catch((err) => console.error("Resend new-message notification failed", err));
}

// Sent once staff confirm the exact price in the dashboard.
export async function sendConfirmedQuote(tenant: Tenant, quote: Quote, smsEnabled: boolean) {
  const resend = getResend();
  if (resend && quote.customer_email) {
    const { subject, html } = resolveEmail(
      tenant,
      "confirmed_quote",
      {
        company_name: tenant.company_name,
        customer_name: quote.customer_name ?? "",
        price: `£${quote.confirmed_price}`,
        phone: tenant.branding?.phone ?? "",
      },
      {
        subject: `Your confirmed price from ${tenant.company_name}`,
        html: `<p>Good news — your move from ${quote.from_postcode} to ${quote.to_postcode} is confirmed at <strong>£${quote.confirmed_price}</strong>.</p>
          <p>Call us on ${tenant.branding?.phone ?? "the number on our site"} to book, or reply to this email.</p>`,
      }
    );
    await resend.emails.send({ from: fromEmail(), to: quote.customer_email, subject, html }).catch((err) => console.error("Resend confirmed quote email failed", err));
  } else {
    console.log("[notifications] (stub) would email confirmed price", quote.id);
  }

  if (smsEnabled && quote.customer_phone) {
    const client = getTwilioClient();
    const from = process.env.TWILIO_FROM_NUMBER;
    if (client && from) {
      await client.messages
        .create({ to: quote.customer_phone, from, body: `${tenant.company_name}: your confirmed price is £${quote.confirmed_price}. Call ${tenant.branding?.phone ?? "us"} to book.` })
        .catch((err) => console.error("Twilio confirmed quote SMS failed", err));
    } else {
      console.log("[notifications] (stub) would SMS confirmed price", quote.id);
    }
  }
}

// Sent when staff send a branded invoice — distinct from the generic
// order-message notification so it has its own configurable template.
export async function sendInvoiceEmail(tenant: Tenant, quote: Quote, invoiceUrl: string, amount: number, label: string) {
  const resend = getResend();
  if (!resend || !quote.customer_email) {
    console.log("[notifications] (stub) would email invoice", quote.id);
    return;
  }
  const { subject, html } = resolveEmail(
    tenant,
    "invoice",
    {
      company_name: tenant.company_name,
      customer_name: quote.customer_name ?? "",
      amount: `£${amount.toFixed(2)}`,
      label,
      link: invoiceUrl,
    },
    {
      subject: `Invoice from ${tenant.company_name} — ${label}`,
      html: `<p>Hi ${quote.customer_name ?? ""} — here's your ${label.toLowerCase()} invoice from ${tenant.company_name}.</p>
        <p><strong>£${amount.toFixed(2)}</strong></p>
        <p><a href="${invoiceUrl}">View and pay your invoice</a></p>`,
    }
  );
  await resend.emails.send({ from: fromEmail(), to: quote.customer_email, subject, html }).catch((err) => console.error("Resend invoice email failed", err));
}
