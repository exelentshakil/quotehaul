import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Tenant } from "@/types/database";

const DEFAULT_FAQS = [
  { question: "Is the online price a fixed quote?", answer: "No — it's an instant guide based on your move. A member of our team reviews every enquiry and confirms the exact price before anything is booked." },
  { question: "How quickly will I hear back?", answer: "We aim to confirm your exact price within a few hours during business hours." },
  { question: "Is there any obligation?", answer: "None. Getting an estimate is free and doesn't commit you to booking." },
  { question: "How do I get a more accurate price?", answer: "The more detail you give us about your move — access, stairs, extra items — the more accurate your confirmed price will be." },
];

export default async function FaqPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const admin = createAdminClient();
  const { data: tenant } = await admin.from("tenants").select("*").eq("slug", slug).single<Tenant>();
  if (!tenant) return notFound();
  const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
  if (!plan?.features.content_pages) return notFound();

  const { data: customFaqs } = await admin.from("faq_items").select("*").eq("tenant_id", tenant.id).order("sort_order");
  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : DEFAULT_FAQS;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-bold">Frequently asked questions</h1>
      <div className="space-y-6">
        {faqs.map((f) => (
          <div key={f.question}>
            <h3 className="font-semibold">{f.question}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
