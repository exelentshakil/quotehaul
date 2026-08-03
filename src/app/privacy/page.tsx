import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>QuoteHaul ("we", "us") provides quote and lead management software to removal companies ("customers"). This page explains, in plain terms, how we handle data.</p>
          <p><strong className="text-foreground">What we collect:</strong> account details for customers who sign up, and enquiry details (name, contact info, move details) submitted by their end customers through a customer's quote funnel.</p>
          <p><strong className="text-foreground">How it's used:</strong> to run the quoting, lead-management, and communication features of the product. We don't sell personal data.</p>
          <p><strong className="text-foreground">Who it's shared with:</strong> only the removal company a quote was submitted to, and service providers we rely on to operate (e.g. hosting, email, payments).</p>
          <p><strong className="text-foreground">Your rights:</strong> contact the removal company you submitted a quote to for data requests relating to your enquiry, or contact us directly for account-level requests.</p>
          <p className="text-xs">This is a placeholder policy pending full legal review — replace with counsel-reviewed terms before processing real customer data at scale.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
