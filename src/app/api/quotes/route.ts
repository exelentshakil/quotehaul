import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDistance } from "@/lib/distance";
import { calculateEstimate } from "@/lib/pricing";
import { hasFeature, isOverLeadCap } from "@/lib/plans";
import { notifyTenantOfNewLead, sendCustomerReceipt } from "@/lib/notifications";
import type { Plan, RateConfig, Tenant } from "@/types/database";

const estimateSchema = z.object({
  stage: z.literal("estimate"),
  tenantSlug: z.string(),
  fromPostcode: z.string().min(2),
  toPostcode: z.string().min(2),
  fromTown: z.string().optional(),
  toTown: z.string().optional(),
  moveDate: z.string().optional(),
  propertySize: z.string(),
  needsStairs: z.boolean().optional(),
  needsPacking: z.boolean().optional(),
});

const contactSchema = z.object({
  stage: z.literal("contact"),
  tenantSlug: z.string(),
  token: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const admin = createAdminClient();

  // Stage 1: calculate + store an instant estimate as a lead (captured even if
  // the visitor never finishes the contact-details step).
  const estimateParsed = estimateSchema.safeParse(body);
  if (estimateParsed.success) {
    const input = estimateParsed.data;

    const { data: tenant } = await admin.from("tenants").select("*").eq("slug", input.tenantSlug).single<Tenant>();
    if (!tenant) return NextResponse.json({ error: "Unknown company" }, { status: 404 });

    const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();
    const { data: rateConfig } = await admin.from("rate_configs").select("*").eq("tenant_id", tenant.id).single<RateConfig>();
    if (!rateConfig) return NextResponse.json({ error: "This company hasn't finished setup yet" }, { status: 400 });

    // Free-tier lead cap check
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const { count } = await admin
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .gte("created_at", startOfMonth.toISOString());

    if (isOverLeadCap(plan, count ?? 0)) {
      return NextResponse.json(
        { error: "This company has reached its monthly lead limit. Please call them directly." },
        { status: 429 }
      );
    }

    const distance = await getDistance(input.fromPostcode, input.toPostcode);
    const estimate = calculateEstimate({
      rateConfig,
      distanceMiles: distance.distanceMiles,
      propertySize: input.propertySize,
      moveDate: input.moveDate,
      needsStairs: input.needsStairs,
      needsPacking: input.needsPacking,
      isSeaCrossing: distance.isSeaCrossing,
    });

    const { data: quote, error } = await admin
      .from("quotes")
      .insert({
        tenant_id: tenant.id,
        from_postcode: input.fromPostcode,
        to_postcode: input.toPostcode,
        from_town: input.fromTown || null,
        to_town: input.toTown || null,
        move_date: input.moveDate || null,
        property_size: input.propertySize,
        distance_miles: distance.distanceMiles,
        is_sea_crossing: distance.isSeaCrossing,
        estimate_low: estimate.low,
        estimate_high: estimate.high,
        status: "new",
      })
      .select()
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: error?.message ?? "Could not save your quote" }, { status: 500 });
    }

    return NextResponse.json({
      estimateLow: estimate.low,
      estimateHigh: estimate.high,
      token: quote.token,
      retrievalEnabled: hasFeature(plan, "saved_quote_retrieval"),
    });
  }

  // Stage 2: attach contact details to the previously-created quote and fire notifications.
  const contactParsed = contactSchema.safeParse(body);
  if (contactParsed.success) {
    const input = contactParsed.data;

    const { data: tenant } = await admin.from("tenants").select("*").eq("slug", input.tenantSlug).single<Tenant>();
    if (!tenant) return NextResponse.json({ error: "Unknown company" }, { status: 404 });

    const { data: plan } = await admin.from("plans").select("*").eq("id", tenant.plan_id).single<Plan>();

    const nextStatus = hasFeature(plan, "human_confirmation_workflow") ? "pending_confirmation" : "new";

    const { data: quote, error } = await admin
      .from("quotes")
      .update({
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        status: nextStatus,
      })
      .eq("token", input.token)
      .eq("tenant_id", tenant.id)
      .select()
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: error?.message ?? "Could not find that quote" }, { status: 404 });
    }

    const smsEnabled = hasFeature(plan, "sms_notifications");
    const retrievalEnabled = hasFeature(plan, "saved_quote_retrieval");

    // Look up the tenant owner's email for the new-lead notification.
    const { data: ownerRow } = await admin
      .from("tenant_users")
      .select("user_id")
      .eq("tenant_id", tenant.id)
      .eq("role", "owner")
      .maybeSingle();
    let ownerEmail: string | null = null;
    if (ownerRow?.user_id) {
      const { data: ownerUser } = await admin.auth.admin.getUserById(ownerRow.user_id);
      ownerEmail = ownerUser.user?.email ?? null;
    }

    await notifyTenantOfNewLead(tenant, quote, ownerEmail, smsEnabled);
    await sendCustomerReceipt(tenant, quote, retrievalEnabled, smsEnabled);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
