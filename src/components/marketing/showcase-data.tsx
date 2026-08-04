import {
  KanbanPreview,
  MessagingPreview,
  ScorePreview,
  QuoteFunnelPreview,
  PageBuilderPreview,
  CapacityPreview,
  InvoicingPreview,
} from "@/components/marketing/product-previews";

export const SHOWCASE_FEATURES = [
  {
    id: "quote-funnel",
    label: "Quote funnel",
    title: "An instant estimate in under 60 seconds",
    body: "A short, branded multi-step form — postcode, date, property size — with a real price range calculated from your own rate card, not a generic guess.",
    Preview: QuoteFunnelPreview,
  },
  {
    id: "kanban",
    label: "Leads board",
    title: "A board that stops leads dying",
    body: "Every enquiry lands as a card, not an email you'll forget to reply to. Drag it through your pipeline and never lose track of who's waiting.",
    Preview: KanbanPreview,
  },
  {
    id: "order-messaging",
    label: "Messaging",
    title: "Customers message you, no portal login",
    body: "Every quote becomes an order with its own thread. Customers reply straight from their email inbox — no 'log in and check' required.",
    Preview: MessagingPreview,
  },
  {
    id: "ai-followup",
    label: "AI follow-up",
    title: "Chases the leads you already paid for",
    body: "Quiet leads get scored and drafted a friendly follow-up automatically — your team just reviews and sends.",
    Preview: ScorePreview,
  },
  {
    id: "ai-page-builder",
    label: "Page builder",
    title: "Describe your page, watch it get built",
    body: "A real visual editor with premium blocks, plus an AI assistant that assembles a whole page from a sentence.",
    Preview: PageBuilderPreview,
  },
  {
    id: "capacity",
    label: "Capacity",
    title: "Stop double-booking a truck",
    body: "Set your crews and daily hours; the calendar closes itself out automatically as bookings come in.",
    Preview: CapacityPreview,
  },
  {
    id: "invoicing",
    label: "Invoicing",
    title: "Send an invoice, get paid however you already do",
    body: "Once a job's confirmed and done, send a deposit or balance request straight into the order thread. QuoteHaul never touches your money.",
    Preview: InvoicingPreview,
  },
] as const;
