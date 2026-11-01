import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { STATUS, type Lead } from "@/lib/types";
import { countryByCode } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const leads = (data ?? []) as Lead[];

  return (
    <div className="max-w-6xl">
      <PageHeader title="Meus leads" subtitle="Negócios salvos. Abra um para gerar o site e enviar a abordagem.">
        <Link href="/painel/clientes" className="btn-accent">+ Localizar mais</Link>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/painel/leads" className={`chip px-3 py-1.5 text-[13px] ${!status ? "bg-ink text-white" : "border border-line bg-surface"}`}>Todos</Link>
        {STATUS.map((s) => (
          <Link key={s.id} href={`/painel/leads?status=${s.id}`} className={`chip px-3 py-1.5 text-[13px] ${status === s.id ? "bg-ink text-white" : "border border-line bg-surface"}`}>
            {s.label}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">Nenhum lead aqui ainda.</p>
          <Link href="/painel/clientes" className="btn-primary mt-4">Localizar clientes</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="border-b border-line bg-bg text-[12px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Negócio</th>
                  <th className="px-5 py-3 font-medium">Nicho</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => {
                  const st = STATUS.find((s) => s.id === l.status) ?? STATUS[0];
                  const c = countryByCode(l.country);
                  const n = nicheById(l.niche);
                  return (
                    <tr key={l.id} className="hover:bg-bg/60">
                      <td className="px-5 py-3.5">
                        <Link href={`/painel/leads/${l.id}`} className="font-semibold hover:text-accent">{l.name}</Link>
                      </td>
                      <td className="px-5 py-3.5">{n.emoji} {n.label}</td>
                      <td className="px-5 py-3.5">{c.flag} {l.city}</td>
                      <td className="px-5 py-3.5 text-muted">{l.phone}</td>
                      <td className="px-5 py-3.5"><span className={`chip ${st.cls}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
