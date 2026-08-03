export type Plan = {
  id: string;
  slug: "free" | "paid";
  name: string;
  price_monthly: number;
  monthly_lead_cap: number | null;
  features: {
    sms_notifications: boolean;
    saved_quote_retrieval: boolean;
    content_pages: boolean;
    human_confirmation_workflow: boolean;
    custom_branding: boolean;
    remove_platform_badge: boolean;
    staff_accounts: boolean;
    analytics: boolean;
  };
};

export type Tenant = {
  id: string;
  slug: string;
  company_name: string;
  plan_id: string;
  branding: { primary_color: string; logo_url: string | null; phone: string | null };
  service_area: Record<string, unknown>;
  onboarding_complete: boolean;
  created_at: string;
};

export type RateConfig = {
  id: string;
  tenant_id: string;
  rate_per_mile: number;
  rate_per_room: Record<string, number>;
  crew_pricing: Record<string, number>;
  minimum_job_price: number;
  surcharges: {
    stairs: number;
    packing: number;
    weekend: number;
    long_distance: number;
    sea_crossing: number;
  };
  service_radius_miles: number;
  long_distance_threshold_miles: number;
};

export type QuoteStatus = "new" | "pending_confirmation" | "confirmed" | "sent" | "booked" | "lost";

export type Quote = {
  id: string;
  tenant_id: string;
  token: string;
  from_postcode: string;
  to_postcode: string;
  from_town: string | null;
  to_town: string | null;
  move_date: string | null;
  property_size: string | null;
  inventory: Record<string, number> | null;
  distance_miles: number | null;
  is_sea_crossing: boolean;
  estimate_low: number | null;
  estimate_high: number | null;
  confirmed_price: number | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  status: QuoteStatus;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};
