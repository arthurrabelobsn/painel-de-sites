import { notFound, redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { countryByCode } from "@/lib/data/locales";
import { defaultSiteData } from "@/lib/templates/defaults";
import type { SiteData, TemplateId } from "@/lib/templates/types";
import { Editor } from "./Editor";

const TEMPLATE_BY_NICHE: Record<string, TemplateId> = {
  barber: "bold",
  "auto-repair": "bold",
  electrician: "bold",
  "hair-salon": "soft",
  restaurant: "soft",
  gardener: "soft",
};

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lead?: string }>;
}) {
  const { id } = await params;
  const { lead: leadId } = await searchParams;
  const supabase = await createClient();
  const user = await getSessionUser();
  const { data: profile } = await supabase.from("profiles").select("gemini_api_key").eq("id", user!.id).single();
  const hasAI = !!profile?.gemini_api_key || !!process.env.GEMINI_API_KEY;

  if (id === "novo") {
    if (!leadId) redirect("/painel/leads");
    const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single();
    if (!lead) notFound();
    const lang = countryByCode(lead.country).lang;
    const initial = defaultSiteData(lead, lang, TEMPLATE_BY_NICHE[lead.niche] ?? "classic");
    return <Editor initial={initial} siteId={null} leadId={lead.id} leadName={lead.name} hasAI={hasAI} />;
  }

  const { data: site } = await supabase.from("sites").select("*, leads(name)").eq("id", id).single();
  if (!site) notFound();
  return (
    <Editor
      initial={site.data as SiteData}
      siteId={site.id}
      leadId={site.lead_id}
      leadName={(site.leads as { name: string } | null)?.name ?? (site.data as SiteData).name}
      hasAI={hasAI}
    />
  );
}
