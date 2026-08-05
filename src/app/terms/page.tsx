import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>By using QuoteHaul, you agree to these terms. Please read them carefully.</p>
          <p><strong className="text-foreground">The service:</strong> QuoteHaul provides a branded quote funnel, lead dashboard, and related tools for removal companies. Instant estimates are guides only; a human confirms every final price.</p>
          <p><strong className="text-foreground">Billing:</strong> QuoteHaul is £97/month, billed automatically starting from signup — there is no free trial or free tier. You can cancel or manage billing any time from Settings.</p>
          <p><strong className="text-foreground">Your data:</strong> leads and enquiries submitted through your funnel are yours. We don't share them with other companies.</p>
          <p><strong className="text-foreground">Acceptable use:</strong> don't use the service for anything unlawful, or to send unsolicited communications.</p>
          <p className="text-xs">This is a placeholder terms page pending full legal review — replace with counsel-reviewed terms before relying on it commercially.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
