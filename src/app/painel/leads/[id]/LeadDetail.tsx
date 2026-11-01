"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS, type Lead, type LeadStatus, type Profile } from "@/lib/types";
import { LANG_NAMES, countryByCode } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";
import { OUTREACH, fillTemplate } from "@/lib/data/outreach";
import { TEMPLATES } from "@/lib/templates/types";

type SiteRow = { id: string; template: string; created_at: string; updated_at: string };

export function LeadDetail({ lead, sites, profile }: { lead: Lead; sites: SiteRow[]; profile: Profile | null }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const country = countryByCode(lead.country);
  const niche = nicheById(lead.niche);
  const lang = country.lang;

  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [email, setEmail] = useState(lead.email ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [tplId, setTplId] = useState(sites.length ? "demo" : "ask");
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const tpl = OUTREACH.find((t) => t.id === tplId)!;
  const demoLink = sites[0] && origin ? `${origin}/demo/${sites[0].id}` : "";
  const vars = useMemo(
    () => ({ name: lead.name, city: lead.city ?? "", link: demoLink, sender: profile?.sender_name || "" }),
    [lead.name, lead.city, demoLink, profile?.sender_name]
  );

  useEffect(() => {
    setText(fillTemplate(tpl.body[lang], vars));
    setSubject(tpl.subject ? fillTemplate(tpl.subject[lang], vars) : "");
  }, [tpl, lang, vars]);

  const needsLink = tpl.body[lang].includes("{link}") && !demoLink;
  const missingSender = !profile?.sender_name;
  const waNumber = (lead.intl_phone || lead.phone || "").replace(/\D/g, "");

  async function updateLead(patch: Partial<Lead>) {
    await supabase.from("leads").update(patch).eq("id", lead.id);
  }

  async function changeStatus(s: LeadStatus) {
    setStatus(s);
    await updateLead({ status: s });
    router.refresh();
  }

  async function markSent() {
    const next: LeadStatus = tpl.body[lang].includes("{link}") ? "demo" : "contatado";
    const order: LeadStatus[] = ["novo", "contatado", "demo", "fechado"];
    if (order.indexOf(next) > order.indexOf(status) && status !== "perdido") await changeStatus(next);
  }

  async function copy() {
    await navigator.clipboard.writeText(subject ? `${subject}\n\n${text}` : text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    markSent();
  }

  async function saveInfo() {
    await updateLead({ email: email || null, notes: notes || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function deleteLead() {
    if (!confirm(`Excluir o lead "${lead.name}"? Os sites gerados continuam salvos.`)) return;
    await supabase.from("leads").delete().eq("id", lead.id);
    router.push("/painel/leads");
    router.refresh();
  }

  return (
    <div className="max-w-6xl">
      <Link href="/painel/leads" className="text-[14px] text-muted hover:text-ink">← Meus leads</Link>
      <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[14px] text-muted">{niche.emoji} {niche.label} · {country.flag} {lead.city}</p>
          <h1 className="text-[30px] font-black tracking-tight">{lead.name}</h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS.map((s) => (
            <button key={s.id} onClick={() => changeStatus(s.id)} className={`chip px-3 py-1.5 text-[13px] transition ${status === s.id ? s.cls + " ring-2 ring-ink/15" : "border border-line bg-surface text-muted hover:text-ink"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Coluna da esquerda: dados + sites */}
        <div className="space-y-6">
          <div className="card space-y-4 p-5">
            <h2 className="font-bold">Dados do negócio</h2>
            <Info label="Telefone" value={lead.phone} />
            <Info label="Endereço" value={lead.address} />
            {lead.rating && <Info label="Google" value={`★ ${lead.rating} · ${lead.reviews} avaliações`} />}
            {lead.maps_url && <a href={lead.maps_url} target="_blank" rel="noopener" className="block text-[14px] font-medium text-accent hover:underline">Abrir no Google Maps ↗</a>}
            <div>
              <label className="label">E-mail (se encontrar no Instagram/Facebook)</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@negocio.com" />
            </div>
            <div>
              <label className="label">Anotações</label>
              <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Falei com o dono, pediu para retornar sexta…" />
            </div>
            <div className="flex items-center justify-between">
              <button className="btn-ghost py-2" onClick={saveInfo}>{saved ? "✓ Salvo" : "Salvar"}</button>
              <button className="text-[13px] text-danger hover:underline" onClick={deleteLead}>Excluir lead</button>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Sites deste lead</h2>
            </div>
            {sites.length === 0 ? (
              <p className="mb-4 text-[14px] text-muted">Nenhum site ainda. Gere a demonstração para mandar o link ou o PDF.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {sites.map((s) => (
                  <li key={s.id}>
                    <Link href={`/painel/sites/${s.id}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[14px] hover:border-ink">
                      <span className="font-medium">Modelo {TEMPLATES.find((t) => t.id === s.template)?.name}</span>
                      <span className="text-muted">{new Date(s.updated_at).toLocaleDateString("pt-BR")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/painel/sites/novo?lead=${lead.id}`} className="btn-accent w-full">
              {sites.length ? "Gerar outro modelo" : "Gerar site de demonstração"}
            </Link>
          </div>
        </div>

        {/* Coluna da direita: abordagem */}
        <div className="card p-5 md:p-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[18px] font-bold">Mensagem de abordagem</h2>
            <span className="chip bg-bg text-muted">Idioma: {LANG_NAMES[lang]}</span>
          </div>
          <p className="mb-4 text-[14px] text-muted">Escolha a mensagem, ajuste se quiser e envie. O link da demo entra sozinho depois que você gerar o site.</p>

          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            {OUTREACH.map((t) => (
              <button key={t.id} onClick={() => setTplId(t.id)} className={`rounded-xl border p-3 text-left transition ${tplId === t.id ? "border-ink bg-bg" : "border-line hover:border-ink/40"}`}>
                <span className="block text-[14px] font-semibold">{t.channel === "email" ? "✉️" : "💬"} {t.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t.hint}</span>
              </button>
            ))}
          </div>

          {missingSender && (
            <p className="mb-3 rounded-xl bg-accent-soft px-3 py-2 text-[13px]">
              Defina seu nome em <Link href="/painel/configuracoes" className="font-semibold underline">Configurações</Link> para assinar as mensagens ({"{sender}"}).
            </p>
          )}
          {needsLink && (
            <p className="mb-3 rounded-xl bg-accent-soft px-3 py-2 text-[13px]">
              Esta mensagem usa o link da demo. <Link href={`/painel/sites/novo?lead=${lead.id}`} className="font-semibold underline">Gere o site primeiro</Link>.
            </p>
          )}

          {tpl.subject && (
            <div className="mb-3">
              <label className="label">Assunto</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          )}
          <textarea className="input min-h-64 font-[inherit] leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} />

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={copy}>{copied ? "✓ Copiado" : "Copiar mensagem"}</button>
            {tpl.channel === "whatsapp" && waNumber && (
              <a className="btn btn-ghost" href={`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" onClick={markSent}>
                Abrir no WhatsApp ↗
              </a>
            )}
            {tpl.channel === "email" && (
              <a
                className={`btn btn-ghost ${!email ? "pointer-events-none opacity-50" : ""}`}
                href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}
                onClick={markSent}
              >
                {email ? "Abrir no e-mail ↗" : "Adicione o e-mail ao lado"}
              </a>
            )}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">
            Boas práticas: mande uma mensagem por negócio, sempre se identifique e respeite quem pedir para não ser contatado.
            Nem todo número fixo tem WhatsApp; se não abrir, use ligação ou e-mail.
          </p>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[15px] font-medium">{value}</p>
    </div>
  );
}
