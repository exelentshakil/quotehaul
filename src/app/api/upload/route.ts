import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Single upload endpoint reused everywhere an image is needed — page builder
// blocks, branding logo, staff avatars — one path, one set of checks, not
// rebuilt per feature. Avatars are keyed by user_id (not tenant-scoped);
// everything else is scoped under the caller's own tenant folder.
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const kind = (formData?.get("kind") as string) || "asset";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Unsupported file type — use PNG, JPEG, WebP, GIF, or SVG" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is too large — 5MB max" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = kind === "avatar"
    ? `users/${user.id}/${Date.now()}.${ext}`
    : `${membership.tenant_id}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("tenant-assets").upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = admin.storage.from("tenant-assets").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
