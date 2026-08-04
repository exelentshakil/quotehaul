import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Data } from "@puckeditor/core";
import { SecondaryPageEditor } from "@/components/secondary-page-editor";

export default async function EditSecondaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return notFound();

  const [{ data: page }, { data: tenant }, { data: faqItems }] = await Promise.all([
    supabase.from("page_layouts").select("*").eq("id", id).eq("tenant_id", membership.tenant_id).single(),
    supabase.from("tenants").select("slug").eq("id", membership.tenant_id).single(),
    supabase.from("faq_items").select("question, answer").eq("tenant_id", membership.tenant_id).order("sort_order"),
  ]);
  if (!page || !tenant) return notFound();

  return (
    <SecondaryPageEditor
      pageId={id}
      pageSlug={page.slug}
      tenantSlug={tenant.slug}
      faqItems={faqItems ?? []}
      data={page.data as Data}
      initialIsPublished={page.is_published}
    />
  );
}
