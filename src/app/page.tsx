import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ValueBar, FeatureShowcase, HowItWorks, PricingSection, FaqSection, FinalCta } from "@/components/marketing/sections";
import { KanbanPreview, MessagingPreview, ScorePreview } from "@/components/marketing/product-previews";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Hero />
      <ValueBar />

      <FeatureShowcase
        eyebrow="Leads"
        title="A board that stops leads dying"
        body="Every enquiry lands as a card, not an email you'll forget to reply to. Drag it through your pipeline, see pipeline value at a glance, and never lose track of who's waiting."
        visual={<KanbanPreview />}
      />
      <FeatureShowcase
        eyebrow="Order messaging"
        title="Customers message you, no portal login"
        body="Every quote becomes an order with its own thread. Customers reply straight from their email inbox — you never have to explain how to 'log in and check'."
        visual={<MessagingPreview />}
        reverse
      />
      <FeatureShowcase
        eyebrow="AI"
        title="AI that chases the leads you already paid for"
        body="Quiet leads get scored and drafted a friendly follow-up automatically — your team just reviews and sends. Jobs won from enquiries that would otherwise go cold."
        visual={<ScorePreview />}
      />

      <HowItWorks />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
