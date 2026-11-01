import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { STATUS } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: leads }, { count: sitesCount }, { data: profile }] = await Promise.all([
    supabase.from("leads").select("id,name,status,city,created_at").order("created_at", { ascending: false }),
    supabase.from("sites").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("sender_name,gemini_api_key").eq("id", user!.id).single(),
  ]);

  const all = leads ?? [];
  const count = (s: string) => all.filter((l) => l.status === s).length;
  const missingSender = !profile?.sender_name;
  const missingAI = !profile?.gemini_api_key;

  const steps = [
    { n: "01", title: "Localize negócios", text: "Escolha nicho, país e cidade. O painel mostra quem tem telefone e não tem site.", href: "/painel/clientes", cta: "Buscar agora" },
    { n: "02", title: "Gere a demonstração", text: "Escolha um modelo, personalize com IA e exporte em PDF ou mande o link.", href: "/painel/leads", cta: "Ver leads" },
    { n: "03", title: "Faça a abordagem", text: "Mensagens prontas no idioma do país, com o link da demo já preenchido.", href: "/painel/leads", cta: "Abordar" },
  ];

  return (
    <div className="max-w-6xl">
      <PageHeader title="Olá 👋" subtitle="Encontre negócios sem site, mostre uma demo pronta e feche o cliente." />

      {(missingSender || missingAI) && (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 border-accent/30 bg-accent-soft p-4">
          <p className="text-[14px]">
            {missingSender && <>Defina <b>seu nome</b> para assinar as mensagens. </>}
            {missingAI && <>Conecte sua <b>chave grátis do Gemini</b> para personalizar os sites com IA.</>}
          </p>
          <Link href="/painel/configuracoes" className="btn-accent">Configurar</Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Leads salvos" value={all.length} />
        <Stat label="Sites gerados" value={sitesCount ?? 0} />
        {STATUS.filter((s) => s.id !== "novo" && s.id !== "perdido").map((s) => (
          <Stat key={s.id} label={s.label} value={count(s.id)} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="card flex flex-col p-6">
            <span className="font-mono text-[13px] text-accent">{s.n}</span>
            <h3 className="mt-2 text-[19px] font-bold">{s.title}</h3>
            <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-muted">{s.text}</p>
            <Link href={s.href} className="btn-ghost mt-5 self-start">{s.cta} →</Link>
          </div>
        ))}
      </div>

      {all.length > 0 && (
        <div className="card mt-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold">Últimos leads</h2>
            <Link href="/painel/leads" className="text-[14px] font-medium text-accent hover:underline">Ver todos</Link>
          </div>
          <ul className="divide-y divide-line">
            {all.slice(0, 5).map((l) => {
              const st = STATUS.find((s) => s.id === l.status) ?? STATUS[0];
              return (
                <li key={l.id}>
                  <Link href={`/painel/leads/${l.id}`} className="flex items-center justify-between py-3 hover:text-accent">
                    <span className="font-medium">{l.name} <span className="text-muted">· {l.city}</span></span>
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[28px] font-black tracking-tight">{value}</p>
    </div>
  );
}
