import type { Config } from "@measured/puck";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// A deliberately small set of blocks — the shared component library
// registered as draggable pieces, not an open-ended page builder. Assembly
// (AI or manual) only ever composes these, never invents new component types.
export type PuckProps = { tenantSlug: string };

const HERO_DEFAULTS = { heading: "Moving house? Get an instant estimate.", subheading: "Free and no obligation — a real person confirms every quote.", ctaLabel: "Get my estimate" };
const FEATURE_DEFAULTS = { title: "Instant, accurate estimates", body: "A price range in about 60 seconds." };
const BADGES_DEFAULT = "Free & no obligation, Instant online estimate, Your details stay private";
const TEXT_DEFAULT = "Write anything here — extra reassurance, service area, or a promise to customers.";

export const puckConfig: Config = {
  components: {
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        ctaLabel: { type: "text" },
      },
      defaultProps: HERO_DEFAULTS,
      // Falls back explicitly (not just via Puck's defaultProps) since a
      // partially-edited component in stored data can omit untouched
      // fields entirely — this must never render as literal "undefined".
      render: ({ heading, subheading, ctaLabel, puck }) => (
        <div className="py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading || HERO_DEFAULTS.heading}</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{subheading || HERO_DEFAULTS.subheading}</p>
          <Button asChild size="lg" className="mt-8">
            <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{ctaLabel || HERO_DEFAULTS.ctaLabel}</Link>
          </Button>
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
    TextBlock: {
      fields: { text: { type: "textarea" } },
      defaultProps: { text: TEXT_DEFAULT },
      render: ({ text }) => <p className="mx-auto max-w-xl py-4 text-center text-muted-foreground">{text || TEXT_DEFAULT}</p>,
    },
  },
};
