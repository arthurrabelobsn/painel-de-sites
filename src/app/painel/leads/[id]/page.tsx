import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetail } from "./LeadDetail";
import type { Lead, Profile } from "@/lib/types";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: lead }, { data: sites }, { data: profile }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("sites").select("id,template,created_at,updated_at").eq("lead_id", id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);
  if (!lead) notFound();

  return <LeadDetail lead={lead as Lead} sites={sites ?? []} profile={profile as Profile | null} />;
}
