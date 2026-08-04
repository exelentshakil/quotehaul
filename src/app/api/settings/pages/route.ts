import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePageLayout, type PuckContent } from "@/lib/ai";
import { searchPhoto, injectHeroPhoto } from "@/lib/unsplash";
import { buildDefaultContent } from "@/lib/puck-config";
import type { RateConfig, Tenant } from "@/types/database";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Additional tenant pages (About, Services, Contact...) — distinct from the
// home page, which keeps its own version history via page_layouts.slug=null.
// Each secondary page is a single row: simpler CRUD, no version switching.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "Name the page first" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", membership.tenant_id).single<Tenant>();
  if (!tenant) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const slug = slugify(body.name);
  if (!slug) return NextResponse.json({ error: "Give the page a real name" }, { status: 400 });

  let content: PuckContent = buildDefaultContent(tenant);
  if (body.prompt?.trim()) {
    const { data: rateConfig } = await supabase.from("rate_configs").select("*").eq("tenant_id", tenant.id).maybeSingle<RateConfig>();
    const [generated, photo] = await Promise.all([
      generatePageLayout(tenant, `Page titled "${body.name}". ${body.prompt}`, rateConfig),
      searchPhoto(`${body.prompt} moving removal company`),
    ]);
    content = injectHeroPhoto(generated, photo);
  }

  const { data: page, error } = await supabase
    .from("page_layouts")
    .insert({ tenant_id: tenant.id, name: body.name.trim(), slug, nav_label: body.name.trim(), is_published: true, data: { content, root: {}, zones: {} } })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "A page with that name already exists" : error.message }, { status: 400 });

  return NextResponse.json({ ok: true, page });
}
