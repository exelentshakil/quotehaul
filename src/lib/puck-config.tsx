import type { Config, CustomField, Overrides, Viewports } from "@puckeditor/core";
import Link from "next/link";
import {
  Check, Sparkles, Quote as QuoteIcon, Home, Truck, Building2, PackageCheck,
  Warehouse, Users, ShieldCheck, Clock, MapPin, Boxes, Star,
  LayoutTemplate, Columns2, Grid3x3, LayoutGrid, CheckCircle2, ListOrdered,
  CheckCheck, HelpCircle, MousePointerClick, Type, Minus, PanelTop, PanelBottom, Images, MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/image-upload";

// One custom field, reused everywhere a block needs an image — real upload
// via Supabase Storage (src/app/api/upload/route.ts), not a paste-a-URL text
// box. `kind` just namespaces the storage path per use (page-image, logo, …).
function imageField(kind: string, shape: "wide" | "square" = "wide"): CustomField<string> {
  return {
    type: "custom",
    render: ({ value, onChange }) => <ImageUpload value={value} onChange={onChange} kind={kind} shape={shape} />,
  };
}

// Tenant pages are now full-width (each block manages its own inner
// max-width — up to max-w-7xl/1280px for structural/image blocks, narrower
// max-w-3xl/max-w-xl for pure-text reading blocks) rather than trapped in a
// narrow centered column, so the editor's "Desktop" viewport is sized to comfortably
// show a full-width section without the near-100%-zoom cropping Puck's
// default 1280px would otherwise force in a typical builder panel.
export const PUCK_VIEWPORTS: Viewports = [
  { width: 380, height: "auto", label: "Mobile", icon: "Smartphone" },
  { width: 1100, height: "auto", label: "Desktop", icon: "Monitor" },
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
  Header: PanelTop,
  Footer: PanelBottom,
  Gallery: Images,
  Testimonials: MessageSquareQuote,
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

// Friendly, non-technical presets — every "layout" control a tenant sees is
// one of these, never a raw CSS/px value. Internally mapped to Tailwind.
const SPACING_MAP = { cozy: "py-8", comfortable: "py-16", spacious: "py-24" } as const;
type SpacingKey = keyof typeof SPACING_MAP;
const SPACING_OPTIONS = [
  { label: "Cozy", value: "cozy" },
  { label: "Comfortable", value: "comfortable" },
  { label: "Spacious", value: "spacious" },
];
const SPACING_FIELD = { type: "radio" as const, label: "Spacing", options: SPACING_OPTIONS };

const BG_MAP = { white: "", tint: "bg-muted/40" } as const;
type BgKey = keyof typeof BG_MAP;
const BG_OPTIONS = [
  { label: "White", value: "white" },
  { label: "Tinted", value: "tint" },
];
const BACKGROUND_FIELD = { type: "radio" as const, label: "Background", options: BG_OPTIONS };

const COLUMNS_OPTIONS = [
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
];
const COLUMNS_FIELD = { type: "select" as const, label: "Columns", options: COLUMNS_OPTIONS };
const COLUMNS_CLASS: Record<string, string> = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" };

// Root (page-level) theme presets — a curated font pairing and corner style
// a tenant can pick without ever seeing a font-family string or a px value.
// Colors intentionally stay driven by the existing Settings > Branding
// primary color (tenantThemeStyle) rather than a second, competing source.
const FONT_OPTIONS = [
  { label: "Modern (Inter)", value: "sans" },
  { label: "Bold (Space Grotesk)", value: "display" },
  { label: "Traditional (Lora)", value: "serif" },
  { label: "Friendly (Nunito)", value: "rounded" },
];
const RADIUS_OPTIONS = [
  { label: "Sharp", value: "0.25rem" },
  { label: "Soft", value: "0.75rem" },
  { label: "Round", value: "1.5rem" },
];

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
const HEADER_DEFAULTS = { tagline: "Get a free instant estimate — booking slots fill up fast", phone: "", buttonLabel: "Get my estimate" };
const FOOTER_LINKS_DEFAULT = [
  { label: "FAQ", url: "#faq" },
  { label: "Get a quote", url: "#" },
];
const GALLERY_DEFAULT: { imageUrl: string }[] = [{ imageUrl: "" }, { imageUrl: "" }, { imageUrl: "" }];
const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ label: `${n} star${n === 1 ? "" : "s"}`, value: String(n) }));
const TESTIMONIALS_DEFAULT = [
  { name: "Sarah T.", quote: "Booked our move in five minutes and the whole thing went smoothly on the day.", avatarUrl: "", rating: "5" },
  { name: "James M.", quote: "Clear pricing up front, no surprises — exactly what we needed.", avatarUrl: "", rating: "5" },
];
const SERVICE_GRID_DEFAULT: { title: string; body: string; icon: IconName }[] = [
  { title: "Home Removals", body: "A complete residential move — furniture, packing, and secure transport.", icon: "Home" },
  { title: "Man & Van", body: "For smaller jobs — quick, careful, and fairly priced.", icon: "Truck" },
  { title: "Office Removals", body: "Minimal downtime, careful handling of equipment.", icon: "Building2" },
];
const IMAGE_TEXT_DEFAULTS = { heading: "About us", body: "We've helped hundreds of local families and businesses move stress-free — friendly, careful, and always on time. Every job is treated like it's our own move.", linkLabel: "Get my estimate" };
const QUOTE_DEFAULT = "Every move is different — that's why we adapt our service to your specific needs.";
const BENEFITS_DEFAULTS = { heading: "Why choose us", body: "A short paragraph on what makes your company trustworthy — experience, ratings, guarantees." };
const BENEFITS_ITEMS_DEFAULT = "Fully insured & professional crews, Transparent, no-surprise pricing, Fast, no-obligation quotes, Real reviews from real customers";

export const puckConfig: Config = {
  root: {
    fields: {
      font: { type: "select", label: "Font style", options: FONT_OPTIONS },
      radius: { type: "radio", label: "Corner style", options: RADIUS_OPTIONS },
    },
    defaultProps: { font: "sans", radius: "0.75rem" },
    render: ({ font, radius, children }: { font?: string; radius?: string; children: React.ReactNode }) => (
      <div style={{ fontFamily: `var(--font-${font || "sans"})`, ["--radius" as string]: radius || "0.75rem" }}>
        {children}
      </div>
    ),
  },
  components: {
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        ctaLabel: { type: "text" },
        backgroundImageUrl: imageField("page-image"),
        backgroundImageCredit: { type: "text" },
        spacing: SPACING_FIELD,
      },
      defaultProps: { ...HERO_DEFAULTS, spacing: "spacious" },
      // Full-width band (no outer max-width) with the text/button content
      // capped and centered inside — falls back explicitly (not just via
      // Puck's defaultProps) since a partially-edited component in stored
      // data can omit untouched fields entirely and must never render as
      // literal "undefined".
      render: ({ heading, subheading, ctaLabel, backgroundImageUrl, backgroundImageCredit, spacing, puck }) => (
        <div className={`relative w-full overflow-hidden text-center ${SPACING_MAP[(spacing as SpacingKey) || "spacious"]}`}>
          {backgroundImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/10" />
            </>
          )}
          <div className="relative mx-auto max-w-3xl px-6">
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
        imageUrl: imageField("page-image"),
        imageCredit: { type: "text" },
        reverse: { type: "radio", options: [{ label: "Image left", value: "false" }, { label: "Image right", value: "true" }] },
        background: BACKGROUND_FIELD,
      },
      defaultProps: { ...IMAGE_TEXT_DEFAULTS, reverse: "false", background: "white" },
      render: ({ heading, body, linkLabel, imageUrl, imageCredit, reverse, background, puck }) => (
        <div className={`w-full ${BG_MAP[(background as BgKey) || "white"]}`}>
          <div className={`mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 sm:grid-cols-2 ${reverse === "true" ? "[&>*:first-child]:sm:order-2" : ""}`}>
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
        columns: COLUMNS_FIELD,
        background: BACKGROUND_FIELD,
      },
      defaultProps: { items: SERVICE_GRID_DEFAULT, columns: "3", background: "white" },
      render: ({ items, columns, background }) => {
        const list: typeof SERVICE_GRID_DEFAULT = items?.length ? items : SERVICE_GRID_DEFAULT;
        return (
          <div className={`w-full ${BG_MAP[(background as BgKey) || "white"]}`}>
            <div className={`mx-auto grid max-w-7xl gap-5 px-6 py-16 ${COLUMNS_CLASS[columns || "3"]}`}>
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
        columns: COLUMNS_FIELD,
        background: BACKGROUND_FIELD,
      },
      defaultProps: { items: FEATURE_GRID_DEFAULT, columns: "3", background: "white" },
      render: ({ items, columns, background }) => {
        const list = items?.length ? items : FEATURE_GRID_DEFAULT;
        return (
          <div className={`w-full ${BG_MAP[(background as BgKey) || "white"]}`}>
            <div className={`mx-auto grid max-w-7xl gap-4 px-6 py-16 ${COLUMNS_CLASS[columns || "3"]}`}>
              {list.map((f: { title: string; body: string }, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    BenefitsSplit: {
      fields: {
        heading: { type: "text" },
        body: { type: "textarea" },
        items: { type: "textarea" },
        spacing: SPACING_FIELD,
      },
      defaultProps: { ...BENEFITS_DEFAULTS, items: BENEFITS_ITEMS_DEFAULT, spacing: "comfortable" },
      render: ({ heading, body, items, spacing }) => {
        const list = (items || BENEFITS_ITEMS_DEFAULT).split(",").map((i: string) => i.trim());
        return (
          <div className={`w-full bg-foreground text-background ${SPACING_MAP[(spacing as SpacingKey) || "comfortable"]}`}>
            <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2">
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
          </div>
        );
      },
    },
    QuoteBanner: {
      fields: { text: { type: "textarea" }, spacing: SPACING_FIELD },
      defaultProps: { text: QUOTE_DEFAULT, spacing: "comfortable" },
      render: ({ text, spacing }) => (
        <div className={`w-full bg-accent text-center ${SPACING_MAP[(spacing as SpacingKey) || "comfortable"]}`}>
          <QuoteIcon className="mx-auto h-6 w-6 text-primary/40" />
          <p className="mx-auto mt-3 max-w-2xl px-6 text-xl font-medium italic text-foreground">{text || QUOTE_DEFAULT}</p>
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
        background: BACKGROUND_FIELD,
      },
      defaultProps: { items: STEPS_DEFAULT, background: "white" },
      render: ({ items, background }) => {
        const list = items?.length ? items : STEPS_DEFAULT;
        return (
          <div className={`w-full ${BG_MAP[(background as BgKey) || "white"]}`}>
            <div className="mx-auto max-w-3xl px-6 py-16">
              <ol className="space-y-4">
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
          </div>
        );
      },
    },
    TrustBadges: {
      fields: { items: { type: "textarea" } },
      defaultProps: { items: BADGES_DEFAULT },
      render: ({ items }) => (
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted-foreground">
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
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 border-y border-border px-6 py-4 text-sm text-muted-foreground">
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
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="mb-4 text-center text-2xl font-bold">{heading || "Frequently asked questions"}</h2>
            <div className="divide-y divide-border">
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
      fields: { heading: { type: "text" }, buttonLabel: { type: "text" }, backgroundImageUrl: imageField("page-image"), spacing: SPACING_FIELD },
      defaultProps: { ...CTA_DEFAULTS, spacing: "comfortable" },
      render: ({ heading, buttonLabel, backgroundImageUrl, spacing, puck }) => (
        <div className={`relative w-full overflow-hidden text-center ${SPACING_MAP[(spacing as SpacingKey) || "comfortable"]}`}>
          {backgroundImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-primary/85" />
            </>
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
          <div className="relative px-6 text-primary-foreground">
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
      render: ({ text }) => <p className="mx-auto max-w-xl px-6 py-4 text-center text-muted-foreground">{text || TEXT_DEFAULT}</p>,
    },
    Divider: {
      fields: {},
      render: () => <hr className="mx-auto my-2 max-w-5xl border-border" />,
    },
    Header: {
      label: "Promo banner",
      fields: {
        logoUrl: imageField("logo", "square"),
        tagline: { type: "text" },
        phone: { type: "text" },
        buttonLabel: { type: "text" },
        links: {
          type: "array",
          arrayFields: { label: { type: "text" }, url: { type: "text" } },
          defaultItemProps: { label: "", url: "" },
        },
      },
      defaultProps: { ...HEADER_DEFAULTS, links: [] },
      // An optional promotional top band a tenant can add on top of the
      // site's persistent TenantNav (never auto-included by default — see
      // buildDefaultContent below) — for a "limited slots this month" banner
      // or an extra nav row, not a replacement for site chrome.
      render: ({ logoUrl, tagline, phone, buttonLabel, links, puck }) => (
        <div className="w-full border-b border-border bg-muted/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
            <div className="flex items-center gap-2.5">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
              )}
              <p className="text-sm font-medium">{tagline || HEADER_DEFAULTS.tagline}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {links?.filter((l: { label: string; url: string }) => l.label).map((l: { label: string; url: string }) => (
                <a key={l.label} href={l.url} className="font-medium text-muted-foreground hover:text-foreground">{l.label}</a>
              ))}
              {phone && <a href={`tel:${phone}`} className="font-medium text-muted-foreground hover:text-foreground">{phone}</a>}
              <Button asChild size="sm">
                <Link href={`/${(puck?.metadata as PuckProps)?.tenantSlug ?? ""}/quote`}>{buttonLabel || HEADER_DEFAULTS.buttonLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    Footer: {
      fields: {
        companyName: { type: "text" },
        phone: { type: "text" },
        email: { type: "text" },
        links: {
          type: "array",
          arrayFields: { label: { type: "text" }, url: { type: "text" } },
          defaultItemProps: FOOTER_LINKS_DEFAULT[0],
        },
      },
      defaultProps: { companyName: "", phone: "", email: "", links: FOOTER_LINKS_DEFAULT },
      render: ({ companyName, phone, email, links }) => {
        const list = links?.length ? links : FOOTER_LINKS_DEFAULT;
        return (
          <div className="w-full border-t border-border bg-muted/30">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                {companyName && <p className="font-semibold">{companyName}</p>}
                <p className="mt-1 text-xs text-muted-foreground">© {new Date().getFullYear()} {companyName || "All rights reserved"}</p>
              </div>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {list.map((l: { label: string; url: string }) => (
                  <li key={l.label}><a href={l.url} className="hover:text-foreground hover:underline">{l.label}</a></li>
                ))}
                {phone && <li><a href={`tel:${phone}`} className="hover:text-foreground hover:underline">{phone}</a></li>}
                {email && <li><a href={`mailto:${email}`} className="hover:text-foreground hover:underline">{email}</a></li>}
              </ul>
            </div>
          </div>
        );
      },
    },
    Gallery: {
      fields: {
        heading: { type: "text" },
        images: {
          type: "array",
          arrayFields: { imageUrl: imageField("gallery") },
          defaultItemProps: { imageUrl: "" },
        },
        columns: COLUMNS_FIELD,
        spacing: SPACING_FIELD,
      },
      defaultProps: { heading: "", images: GALLERY_DEFAULT, columns: "3", spacing: "comfortable" },
      render: ({ heading, images, columns, spacing }) => {
        const list: { imageUrl: string }[] = images?.length ? images : GALLERY_DEFAULT;
        return (
          <div className={`w-full ${SPACING_MAP[(spacing as SpacingKey) || "comfortable"]}`}>
            <div className="mx-auto max-w-7xl px-6">
              {heading && <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">{heading}</h2>}
              <div className={`grid gap-3 ${COLUMNS_CLASS[columns || "3"]}`}>
                {list.map((img, i) =>
                  img.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover shadow-card" />
                  ) : (
                    <div key={i} className="aspect-square w-full rounded-xl bg-gradient-to-br from-primary/15 to-accent" />
                  )
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    Testimonials: {
      fields: {
        heading: { type: "text" },
        items: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            quote: { type: "textarea" },
            avatarUrl: imageField("avatar", "square"),
            rating: { type: "select", options: RATING_OPTIONS },
          },
          defaultItemProps: TESTIMONIALS_DEFAULT[0],
        },
        background: BACKGROUND_FIELD,
      },
      defaultProps: { heading: "What customers say", items: TESTIMONIALS_DEFAULT, background: "tint" },
      render: ({ heading, items, background }) => {
        const list: typeof TESTIMONIALS_DEFAULT = items?.length ? items : TESTIMONIALS_DEFAULT;
        return (
          <div className={`w-full ${BG_MAP[(background as BgKey) || "tint"]}`}>
            <div className="mx-auto max-w-7xl px-6 py-16">
              {heading && <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">{heading}</h2>}
              <div className="grid gap-5 sm:grid-cols-2">
                {list.map((t, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Number(t.rating) || 5 }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-2.5">
                      {t.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <Avatar name={t.name || "?"} className="h-8 w-8 text-[10px]" />
                      )}
                      <p className="text-sm font-medium">{t.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      },
    },
  },
};

// TenantNav (src/components/tenant-nav.tsx) is already the persistent site
// header on every public page — a Header block is deliberately NOT seeded
// here by default (it used to be, and stacked visually with TenantNav).
// The "Header" block stays available in the picker (labelled "Promo banner")
// for tenants who want an optional extra band, but is opt-in only.
export function buildDefaultContent(tenant: { company_name: string; branding?: { phone: string | null } | null }) {
  return [
    { type: "Hero", props: { id: "hero-1", ...HERO_DEFAULTS, spacing: "spacious" } },
    { type: "ValueProps", props: { id: "value-1", items: VALUE_PROPS_DEFAULT } },
    { type: "ServiceGrid", props: { id: "services-1", items: SERVICE_GRID_DEFAULT, columns: "3", background: "white" } },
    { type: "ImageTextSplit", props: { id: "about-1", ...IMAGE_TEXT_DEFAULTS, reverse: "false", background: "white" } },
    { type: "QuoteBanner", props: { id: "quote-1", text: QUOTE_DEFAULT, spacing: "comfortable" } },
    { type: "BenefitsSplit", props: { id: "benefits-1", ...BENEFITS_DEFAULTS, items: BENEFITS_ITEMS_DEFAULT, spacing: "comfortable" } },
    { type: "Steps", props: { id: "steps-1", items: STEPS_DEFAULT, background: "tint" } },
    { type: "LiveFAQ", props: { id: "faq-1", heading: "Frequently asked questions" } },
    { type: "CTASection", props: { id: "cta-1", ...CTA_DEFAULTS, spacing: "comfortable" } },
    { type: "Footer", props: { id: "footer-1", companyName: tenant.company_name, phone: tenant.branding?.phone ?? "", email: "", links: FOOTER_LINKS_DEFAULT } },
  ];
}
