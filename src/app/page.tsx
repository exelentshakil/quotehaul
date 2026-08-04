import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ValueBar, FeatureShowcase, DualFeatureShowcase, StatFeatureShowcase, RoiSection, ComparisonSection, HowItWorks, PricingSection, FaqSection, FinalCta } from "@/components/marketing/sections";
import { KanbanPreview, MessagingPreview, ScorePreview, QuoteFunnelPreview, PageBuilderPreview, CapacityPreview, InvoicingPreview } from "@/components/marketing/product-previews";
import { InteractiveShowcase } from "@/components/marketing/interactive-showcase";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Hero />
      <ValueBar />
      <RoiSection />
      <InteractiveShowcase />

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
          tint
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

      <DualFeatureShowcase
        eyebrow="Built-in AI"
        title="AI that does the admin, not the talking"
        body="Two places AI quietly saves your team time — chasing leads that went quiet, and building your website in the first place."
        items={[
          {
            id: "ai-followup",
            label: "AI follow-up & scoring",
            title: "Chases the leads you already paid for",
            body: "Quiet leads get scored and drafted a friendly follow-up automatically — your team just reviews and sends.",
            visual: <ScorePreview />,
          },
          {
            id: "ai-page-builder",
            label: "AI page builder",
            title: "Describe your page, watch it get built",
            body: "A real visual editor with premium blocks, plus an AI assistant that assembles a whole page from a sentence.",
            visual: <PageBuilderPreview />,
          },
        ]}
      />

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
        <StatFeatureShowcase
          eyebrow="Invoicing"
          title="Send an invoice, get paid however you already do"
          body="Once a job's confirmed and done, send a deposit or balance request straight into the order thread — the customer gets it by email. You get paid your own way: bank transfer, card reader, cash. QuoteHaul never touches your money."
          stat="£0"
          statLabel="held by QuoteHaul, ever"
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
