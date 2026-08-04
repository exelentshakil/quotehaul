import type { Config, Overrides, Viewports } from "@puckeditor/core";
import Link from "next/link";
import {
  Check, Sparkles, Quote as QuoteIcon, Home, Truck, Building2, PackageCheck,
  Warehouse, Users, ShieldCheck, Clock, MapPin, Boxes,
  LayoutTemplate, Columns2, Grid3x3, LayoutGrid, CheckCircle2, ListOrdered,
  CheckCheck, HelpCircle, MousePointerClick, Type, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Matches the real tenant page container (`max-w-3xl` + `px-6` = 816px) —
// not Puck's default 1280px "desktop" — so the editor canvas is both
// accurately WYSIWYG and doesn't need to auto-shrink to an unreadable zoom
// just to fit the panel.
export const PUCK_VIEWPORTS: Viewports = [
  { width: 380, height: "auto", label: "Mobile", icon: "Smartphone" },
  { width: 816, height: "auto", label: "Desktop", icon: "Monitor" },
];

const COMPONENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Hero: LayoutTemplate,
  ImageTextSplit: Columns2,
  ServiceGrid: Grid3x3,
  FeatureGrid: LayoutGrid,
  BenefitsSplit: CheckCircle2,
  QuoteBanner: QuoteIcon,
  Steps: ListOrdered,
  TrustBadges: ShieldCheck,
  ValueProps: CheckCheck,
  LiveFAQ: HelpCircle,
  CTASection: MousePointerClick,
  TextBlock: Type,
  Divider: Minus,
};

export const puckOverrides: Partial<Overrides> = {
  componentItem: ({ children, name }) => {
    const Icon = COMPONENT_ICONS[name];
    return (
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {children}
      </div>
    );
  },
};

// A deliberately small set of blocks — the shared component library
// registered as draggable pieces, not an open-ended page builder. Assembly
// (AI or manual) only ever composes these, never invents new component types.
export type PuckProps = { tenantSlug: string; faqItems: { question: string; answer: string }[] };

const ICONS = { Home, Truck, Building2, PackageCheck, Warehouse, Users, ShieldCheck, Clock, MapPin, Boxes } as const;
type IconName = keyof typeof ICONS;
const ICON_OPTIONS = Object.keys(ICONS).map((k) => ({ label: k, value: k }));

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
const SERVICE_GRID_DEFAULT: { title: string; body: string; icon: IconName }[] = [
  { title: "Home Removals", body: "A complete residential move — furniture, packing, and secure transport.", icon: "Home" },
  { title: "Man & Van", body: "For smaller jobs — quick, careful, and fairly priced.", icon: "Truck" },
  { title: "Office Removals", body: "Minimal downtime, careful handling of equipment.", icon: "Building2" },
];
const IMAGE_TEXT_DEFAULTS = { heading: "About us", body: "Tell customers who you are, how long you've been moving people, and what makes you different.", linkLabel: "Get my estimate" };
const QUOTE_DEFAULT = "Every move is different — that's why we adapt our service to your specific needs.";
const BENEFITS_DEFAULTS = { heading: "Why choose us", body: "A short paragraph on what makes your company trustworthy — experience, ratings, guarantees." };
const BENEFITS_ITEMS_DEFAULT = "Fully insured & professional crews, Transparent, no-surprise pricing, Fast, no-obligation quotes, Real reviews from real customers";

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
        <div className="relative overflow-hidden rounded-2xl py-20 text-center">
          {backgroundImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/10" />
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
    ImageTextSplit: {
      fields: {
        heading: { type: "text" },
        body: { type: "textarea" },
        linkLabel: { type: "text" },
        imageUrl: { type: "text" },
        imageCredit: { type: "text" },
        reverse: { type: "radio", options: [{ label: "Image left", value: "false" }, { label: "Image right", value: "true" }] },
      },
      defaultProps: { ...IMAGE_TEXT_DEFAULTS, reverse: "false" },
      render: ({ heading, body, linkLabel, imageUrl, imageCredit, reverse, puck }) => (
        <div className={`grid items-center gap-8 py-10 sm:grid-cols-2 ${reverse === "true" ? "[&>*:first-child]:sm:order-2" : ""}`}>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/15 to-accent" />
            )}
            {imageUrl && imageCredit && <p className="bg-card px-3 py-1 text-[10px] text-muted-foreground">Photo by {imageCredit} on Unsplash</p>}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{heading || IMAGE_TEXT_DEFAULTS.heading}</h2>
            <p className="mt-3 text-muted-foreground">{body || IMAGE_TEXT_DEFAULTS.body}</p>
            <Button asChild className="mt-5">
              <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{linkLabel || IMAGE_TEXT_DEFAULTS.linkLabel}</Link>
            </Button>
          </div>
        </div>
      ),
    },
    ServiceGrid: {
      fields: {
        items: {
          type: "array",
          arrayFields: { title: { type: "text" }, body: { type: "textarea" }, icon: { type: "select", options: ICON_OPTIONS } },
          defaultItemProps: SERVICE_GRID_DEFAULT[0],
        },
      },
      defaultProps: { items: SERVICE_GRID_DEFAULT },
      render: ({ items }) => {
        const list: typeof SERVICE_GRID_DEFAULT = items?.length ? items : SERVICE_GRID_DEFAULT;
        return (
          <div className="grid gap-5 py-6 sm:grid-cols-3">
            {list.map((s, i) => {
              const Icon = ICONS[s.icon] ?? Truck;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-popover">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-4 font-semibold">{s.title}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        );
      },
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
    BenefitsSplit: {
      fields: {
        heading: { type: "text" },
        body: { type: "textarea" },
        items: { type: "textarea" },
      },
      defaultProps: { ...BENEFITS_DEFAULTS, items: BENEFITS_ITEMS_DEFAULT },
      render: ({ heading, body, items }) => {
        const list = (items || BENEFITS_ITEMS_DEFAULT).split(",").map((i: string) => i.trim());
        return (
          <div className="grid gap-8 rounded-2xl bg-foreground px-6 py-12 text-background sm:grid-cols-2 sm:px-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{heading || BENEFITS_DEFAULTS.heading}</h2>
              <p className="mt-3 text-background/70">{body || BENEFITS_DEFAULTS.body}</p>
            </div>
            <ul className="space-y-3">
              {list.map((item: string) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary"><Check className="h-3.5 w-3.5 text-primary-foreground" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      },
    },
    QuoteBanner: {
      fields: { text: { type: "textarea" } },
      defaultProps: { text: QUOTE_DEFAULT },
      render: ({ text }) => (
        <div className="rounded-2xl bg-accent px-6 py-12 text-center">
          <QuoteIcon className="mx-auto h-6 w-6 text-primary/40" />
          <p className="mx-auto mt-3 max-w-2xl text-xl font-medium italic text-foreground">{text || QUOTE_DEFAULT}</p>
        </div>
      ),
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
      fields: { heading: { type: "text" }, buttonLabel: { type: "text" }, backgroundImageUrl: { type: "text" } },
      defaultProps: CTA_DEFAULTS,
      render: ({ heading, buttonLabel, backgroundImageUrl, puck }) => (
        <div className="relative overflow-hidden rounded-2xl px-6 py-14 text-center">
          {backgroundImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-primary/85" />
            </>
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
          <div className="relative text-primary-foreground">
            <h2 className="text-2xl font-bold">{heading || CTA_DEFAULTS.heading}</h2>
            <Button asChild size="lg" variant="secondary" className="mt-5">
              <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{buttonLabel || CTA_DEFAULTS.buttonLabel}</Link>
            </Button>
          </div>
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
  { type: "ServiceGrid", props: { id: "services-1", items: SERVICE_GRID_DEFAULT } },
  { type: "ImageTextSplit", props: { id: "about-1", ...IMAGE_TEXT_DEFAULTS, reverse: "false" } },
  { type: "QuoteBanner", props: { id: "quote-1", text: QUOTE_DEFAULT } },
  { type: "BenefitsSplit", props: { id: "benefits-1", ...BENEFITS_DEFAULTS, items: BENEFITS_ITEMS_DEFAULT } },
  { type: "Steps", props: { id: "steps-1", items: STEPS_DEFAULT } },
  { type: "LiveFAQ", props: { id: "faq-1", heading: "Frequently asked questions" } },
  { type: "CTASection", props: { id: "cta-1", ...CTA_DEFAULTS } },
];
