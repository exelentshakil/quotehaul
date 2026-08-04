import type { Config } from "@measured/puck";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// A deliberately small set of blocks — the shared component library
// registered as draggable pieces, not an open-ended page builder. Assembly
// (AI or manual) only ever composes these, never invents new component types.
export type PuckProps = { tenantSlug: string; faqItems: { question: string; answer: string }[] };

const HERO_DEFAULTS = { heading: "Moving house? Get an instant estimate.", subheading: "Free and no obligation — a real person confirms every quote.", ctaLabel: "Get my estimate" };
const FEATURE_DEFAULTS = { title: "Instant, accurate estimates", body: "A price range in about 60 seconds." };
const BADGES_DEFAULT = "Free & no obligation, Instant online estimate, Your details stay private";
const TEXT_DEFAULT = "Write anything here — extra reassurance, service area, or a promise to customers.";
const FEATURE_GRID_DEFAULT = [
  { title: "Instant, accurate estimates", body: "A real price range in about 60 seconds, from your own rates." },
  { title: "Every enquiry captured", body: "Nothing falls through the cracks — every lead lands on your board." },
  { title: "A person confirms every quote", body: "The instant estimate is a guide; your team locks in the exact price." },
];
const STEPS_DEFAULT = [
  { title: "Get a quote", body: "The customer answers a few quick questions online." },
  { title: "We confirm it's right", body: "Your team reviews and confirms the exact price." },
  { title: "Booked in", body: "The job goes on your calendar, ready to go." },
];
const VALUE_PROPS_DEFAULT = "Local & long-distance moves, Free & no obligation, Your details stay private";
const CTA_DEFAULTS = { heading: "Ready to get moving?", buttonLabel: "Get my estimate" };

export const puckConfig: Config = {
  components: {
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        ctaLabel: { type: "text" },
        backgroundImageUrl: { type: "text" },
        backgroundImageCredit: { type: "text" },
      },
      defaultProps: HERO_DEFAULTS,
      // Falls back explicitly (not just via Puck's defaultProps) since a
      // partially-edited component in stored data can omit untouched
      // fields entirely — this must never render as literal "undefined".
      render: ({ heading, subheading, ctaLabel, backgroundImageUrl, backgroundImageCredit, puck }) => (
        <div className="relative overflow-hidden rounded-2xl py-16 text-center">
          {backgroundImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
            </>
          )}
          <div className="relative">
            <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${backgroundImageUrl ? "text-white" : ""}`}>{heading || HERO_DEFAULTS.heading}</h1>
            <p className={`mx-auto mt-4 max-w-xl ${backgroundImageUrl ? "text-white/90" : "text-muted-foreground"}`}>{subheading || HERO_DEFAULTS.subheading}</p>
            <Button asChild size="lg" className="mt-8">
              <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{ctaLabel || HERO_DEFAULTS.ctaLabel}</Link>
            </Button>
          </div>
          {backgroundImageUrl && backgroundImageCredit && (
            <p className="relative mt-3 text-[10px] text-white/60">Photo by {backgroundImageCredit} on Unsplash</p>
          )}
        </div>
      ),
    },
    FeatureCard: {
      fields: { title: { type: "text" }, body: { type: "textarea" } },
      defaultProps: FEATURE_DEFAULTS,
      render: ({ title, body }) => (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="font-semibold">{title || FEATURE_DEFAULTS.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body || FEATURE_DEFAULTS.body}</p>
        </div>
      ),
    },
    FeatureGrid: {
      fields: {
        items: {
          type: "array",
          arrayFields: { title: { type: "text" }, body: { type: "textarea" } },
          defaultItemProps: FEATURE_GRID_DEFAULT[0],
        },
      },
      defaultProps: { items: FEATURE_GRID_DEFAULT },
      render: ({ items }) => {
        const list = items?.length ? items : FEATURE_GRID_DEFAULT;
        return (
          <div className="grid gap-4 py-6 sm:grid-cols-3">
            {list.map((f: { title: string; body: string }, i: number) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    Steps: {
      fields: {
        items: {
          type: "array",
          arrayFields: { title: { type: "text" }, body: { type: "textarea" } },
          defaultItemProps: STEPS_DEFAULT[0],
        },
      },
      defaultProps: { items: STEPS_DEFAULT },
      render: ({ items }) => {
        const list = items?.length ? items : STEPS_DEFAULT;
        return (
          <div className="py-6">
            <ol className="mx-auto max-w-xl space-y-4">
              {list.map((s: { title: string; body: string }, i: number) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      },
    },
    TrustBadges: {
      fields: { items: { type: "textarea" } },
      defaultProps: { items: BADGES_DEFAULT },
      render: ({ items }) => (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-6 text-sm text-muted-foreground">
          {(items || BADGES_DEFAULT).split(",").map((i: string) => (
            <li key={i} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> {i.trim()}</li>
          ))}
        </ul>
      ),
    },
    ValueProps: {
      fields: { items: { type: "textarea" } },
      defaultProps: { items: VALUE_PROPS_DEFAULT },
      render: ({ items }) => (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
          {(items || VALUE_PROPS_DEFAULT).split(",").map((i: string) => (
            <li key={i} className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> {i.trim()}</li>
          ))}
        </ul>
      ),
    },
    LiveFAQ: {
      fields: { heading: { type: "text" } },
      defaultProps: { heading: "Frequently asked questions" },
      // Reads the tenant's real FAQ (kept in sync via Settings → AI content)
      // rather than storing static copy — never goes stale, nothing to re-edit.
      render: ({ heading, puck }) => {
        const faq = (puck?.metadata as PuckProps)?.faqItems ?? [];
        if (!faq.length) return <></>;
        return (
          <div className="py-8">
            <h2 className="mb-4 text-center text-2xl font-bold">{heading || "Frequently asked questions"}</h2>
            <div className="mx-auto max-w-xl divide-y divide-border">
              {faq.map((f) => (
                <div key={f.question} className="py-3">
                  <p className="font-medium">{f.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    CTASection: {
      fields: { heading: { type: "text" }, buttonLabel: { type: "text" } },
      defaultProps: CTA_DEFAULTS,
      render: ({ heading, buttonLabel, puck }) => (
        <div className="rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold">{heading || CTA_DEFAULTS.heading}</h2>
          <Button asChild size="lg" variant="secondary" className="mt-5">
            <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{buttonLabel || CTA_DEFAULTS.buttonLabel}</Link>
          </Button>
        </div>
      ),
    },
    TextBlock: {
      fields: { text: { type: "textarea" } },
      defaultProps: { text: TEXT_DEFAULT },
      render: ({ text }) => <p className="mx-auto max-w-xl py-4 text-center text-muted-foreground">{text || TEXT_DEFAULT}</p>,
    },
    Divider: {
      fields: {},
      render: () => <hr className="my-2 border-border" />,
    },
  },
};

export const RICH_DEFAULT_CONTENT = [
  { type: "Hero", props: { id: "hero-1", ...HERO_DEFAULTS } },
  { type: "ValueProps", props: { id: "value-1", items: VALUE_PROPS_DEFAULT } },
  { type: "FeatureGrid", props: { id: "features-1", items: FEATURE_GRID_DEFAULT } },
  { type: "Steps", props: { id: "steps-1", items: STEPS_DEFAULT } },
  { type: "LiveFAQ", props: { id: "faq-1", heading: "Frequently asked questions" } },
  { type: "CTASection", props: { id: "cta-1", ...CTA_DEFAULTS } },
];
