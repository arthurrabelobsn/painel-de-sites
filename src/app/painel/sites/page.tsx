import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { TEMPLATES, type SiteData } from "@/lib/templates/types";
import { nicheById } from "@/lib/data/niches";

export default async function SitesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id,template,data,updated_at,lead_id")
    .order("updated_at", { ascending: false });
  const sites = data ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="Sites gerados" subtitle="Todas as demonstrações que você criou. Para gerar um novo, abra um lead." />
      {sites.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">Nenhum site ainda.</p>
          <Link href="/painel/leads" className="btn-primary mt-4">Escolher um lead</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => {
            const d = s.data as SiteData;
            const n = nicheById(d.nicheId);
            return (
              <Link key={s.id} href={`/painel/sites/${s.id}`} className="card group overflow-hidden transition hover:border-ink">
                <div className="flex h-28 items-end p-4" style={{ background: `linear-gradient(135deg, ${d.primary}, ${d.dark})` }}>
                  <span className="text-[22px] font-black leading-tight text-white">{d.name}</span>
                </div>
                <div className="flex items-center justify-between p-4 text-[14px]">
                  <span>
                    {n.emoji} {d.city} · <span className="text-muted">{TEMPLATES.find((t) => t.id === s.template)?.name}</span>
                  </span>
                  <span className="text-muted">{new Date(s.updated_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
