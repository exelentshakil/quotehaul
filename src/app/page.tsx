import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ValueBar, FeatureShowcase, RoiSection, ComparisonSection, HowItWorks, PricingSection, FaqSection, FinalCta } from "@/components/marketing/sections";
import { KanbanPreview, MessagingPreview, ScorePreview, QuoteFunnelPreview, PageBuilderPreview, CapacityPreview, InvoicingPreview } from "@/components/marketing/product-previews";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Hero />
      <ValueBar />
      <RoiSection />

      <div id="quote-funnel">
        <FeatureShowcase
          eyebrow="Quote funnel & wizard"
          title="An instant estimate in under 60 seconds"
          body="A short, branded multi-step form — postcode, date, property size — with a real price range calculated from your own rate card, not a generic guess."
          visual={<QuoteFunnelPreview />}
        />
      </div>
      <div id="kanban">
        <FeatureShowcase
          eyebrow="Kanban leads board"
          title="A board that stops leads dying"
          body="Every enquiry lands as a card, not an email you'll forget to reply to. Drag it through your pipeline, see pipeline value at a glance, and never lose track of who's waiting."
          visual={<KanbanPreview />}
          reverse
        />
      </div>
      <div id="order-messaging">
        <FeatureShowcase
          eyebrow="Order messaging"
          title="Customers message you, no portal login"
          body="Every quote becomes an order with its own thread. Customers reply straight from their email inbox — you never have to explain how to 'log in and check'."
          visual={<MessagingPreview />}
        />
      </div>
      <div id="ai-followup">
        <FeatureShowcase
          eyebrow="AI follow-up & scoring"
          title="AI that chases the leads you already paid for"
          body="Quiet leads get scored and drafted a friendly follow-up automatically — your team just reviews and sends. Jobs won from enquiries that would otherwise go cold."
          visual={<ScorePreview />}
          reverse
        />
      </div>
      <div id="ai-page-builder">
        <FeatureShowcase
          eyebrow="AI page builder"
          title="Describe your page, watch it get built"
          body="A real visual editor with premium, conversion-ready blocks — plus an AI assistant that assembles a whole page from a sentence. No design tool, no developer."
          visual={<PageBuilderPreview />}
        />
      </div>
      <div id="capacity">
        <FeatureShowcase
          eyebrow="Capacity & calendar"
          title="Stop double-booking a truck"
          body="Set your crews and daily hours; the calendar closes itself out automatically as bookings come in. A manual block or force-open always wins if you need to override it."
          visual={<CapacityPreview />}
          reverse
        />
      </div>
      <div id="invoicing">
        <FeatureShowcase
          eyebrow="Invoicing"
          title="Get paid without chasing an invoice"
          body="Request a deposit or final balance straight from the order — paid directly into your own Stripe account. QuoteHaul never holds your money."
          visual={<InvoicingPreview />}
        />
      </div>

      <ComparisonSection />
      <HowItWorks />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
