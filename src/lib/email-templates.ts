import type { EmailTemplateType } from "@/types/database";

// One entry per configurable email type — drives both the Settings UI (list
// of editable templates + their available tokens) and documents what each
// notifications.ts function substitutes when an override is present.
export const EMAIL_TEMPLATE_TYPES: { type: EmailTemplateType; label: string; description: string; tokens: string[] }[] = [
  { type: "new_lead", label: "New lead alert", description: "Sent to you when a new quote request comes in.", tokens: ["company_name", "customer_name", "route", "link"] },
  { type: "customer_receipt", label: "Customer receipt", description: "Sent to the customer with their instant estimate.", tokens: ["company_name", "customer_name", "estimate"] },
  { type: "order_message", label: "Order message notification", description: "Sent when a new message is posted to an order thread.", tokens: ["company_name", "author_name", "message", "link"] },
  { type: "confirmed_quote", label: "Confirmed price", description: "Sent to the customer once you confirm their exact price.", tokens: ["company_name", "customer_name", "price", "phone"] },
  { type: "invoice", label: "Invoice", description: "Sent to the customer when you send them an invoice.", tokens: ["company_name", "customer_name", "amount", "label", "link"] },
];

// Simple {{token}} substitution — not a full template engine, just the
// fixed, documented set of tokens each email type supports (see above).
export function fillTemplate(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce((text, [key, value]) => text.split(`{{${key}}}`).join(value), template);
}
