import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Resolves a request's hostname to a tenant slug and rewrites to the
// existing /[tenant] route — no tenant page component needed to change.
// Two hostname shapes count as "this is a tenant, not the app itself":
//   1. A custom domain a tenant added in Settings (tenants.custom_domain).
//   2. A subdomain of a QuoteHaul-owned domain (tenants.slug), once one is
//      configured via NEXT_PUBLIC_APP_DOMAIN — until then this never
//      matches anything, and path-based /[tenant] links keep working.
async function resolveTenantSlugForHost(host: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  const subdomainSlug = appDomain && host.endsWith(`.${appDomain}`) ? host.slice(0, -(appDomain.length + 1)) : null;

  const filter = subdomainSlug
    ? `slug=eq.${encodeURIComponent(subdomainSlug)}`
    : `custom_domain=eq.${encodeURIComponent(host)}`;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/tenants?${filter}&select=slug&limit=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      // Middleware runs per-request; keep this fast and uncached misses cheap.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.slug ?? null;
  } catch {
    return null;
  }
}

function isAppHost(host: string) {
  const configuredHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").host;
    } catch {
      return "localhost:3000";
    }
  })();
  return host === configuredHost || host.endsWith(".vercel.app") || host.startsWith("localhost");
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (!isAppHost(host)) {
    const slug = await resolveTenantSlugForHost(host);
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/${slug}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if ((request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/page-builder")) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // No free tier anymore — an inactive/lapsed subscription locks the staff
  // dashboard down to Settings/Billing (where they can reactivate) rather
  // than offering a degraded-but-functional free experience. The public
  // quote funnel is unaffected by this — it's a separate route tree.
  if (user && request.nextUrl.pathname.startsWith("/dashboard") && !request.nextUrl.pathname.startsWith("/dashboard/settings")) {
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("tenants(subscription_status)")
      .eq("user_id", user.id)
      .maybeSingle();
    const tenantRow = membership?.tenants as unknown as { subscription_status: string | null } | null;
    if (tenantRow && tenantRow.subscription_status !== "active") {
      return NextResponse.redirect(new URL("/dashboard/settings", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
