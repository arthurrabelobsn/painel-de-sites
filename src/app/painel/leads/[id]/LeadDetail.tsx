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
import { FlowSteps } from "@/components/FlowSteps";

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
  const [tplId, setTplId] = useState("demo");
  const [siteSel, setSiteSel] = useState(sites[0]?.id ?? "");
  const [linkCopied, setLinkCopied] = useState(false);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const tpl = OUTREACH.find((t) => t.id === tplId)!;
  const site = sites.find((s) => s.id === siteSel) ?? sites[0];
  const demoLink = site && origin ? `${origin}/demo/${site.id}` : "";
  const hasSite = sites.length > 0;
  const sent = status === "demo" || status === "fechado";
  const vars = useMemo(
    () => ({ name: lead.name, city: lead.city ?? "", link: demoLink, sender: profile?.sender_name || "" }),
    [lead.name, lead.city, demoLink, profile?.sender_name]
  );

  useEffect(() => {
    setText(fillTemplate(tpl.body[lang], vars));
    setSubject(tpl.subject ? fillTemplate(tpl.subject[lang], vars) : "");
  }, [tpl, lang, vars]);

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

  async function copyLink() {
    await navigator.clipboard.writeText(demoLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
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

  const tplName = (id: string) => TEMPLATES.find((t) => t.id === id)?.name ?? id;
  const withLink = OUTREACH.filter((t) => t.body[lang].includes("{link}"));
  const others = OUTREACH.filter((t) => !t.body[lang].includes("{link}"));

  return (
    <div className="max-w-6xl">
      <Link href="/painel/leads" className="text-[14px] text-muted hover:text-ink">← Meus leads</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-4">
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

      <div className="card mb-6 px-5 py-4">
        <FlowSteps leadId={lead.id} siteId={site?.id} current={hasSite ? 3 : 2} siteDone={hasSite} sentDone={sent} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Etapa 1: o cliente */}
        <div className="card h-fit space-y-4 p-5">
          <StepTitle n={1} done title="Cliente" />
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

        <div className="space-y-6">
          {/* Etapa 2: o site */}
          <div className="card p-5 md:p-6">
            <StepTitle n={2} done={hasSite} title="Site de demonstração" />
            {!hasSite ? (
              <div className="mt-3">
                <p className="max-w-xl text-[15px] text-muted">
                  O modelo feito para {niche.label.toLowerCase()} já vem com fotos, textos em {LANG_NAMES[lang]} e os dados deste negócio.
                  Gerar não gasta nada: ajuste o que quiser e salve.
                </p>
                <Link href={`/painel/sites/novo?lead=${lead.id}`} className="btn-accent mt-4">Criar o site →</Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-[260px_1fr]">
                <a href={demoLink || "#"} target="_blank" rel="noopener" className="group relative block h-[170px] overflow-hidden rounded-xl border border-line bg-surface">
                  {site && (
                    <iframe title="Prévia do site" src={`/demo/${site.id}`} sandbox="" loading="lazy" tabIndex={-1} className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 1280, height: 840, transform: "scale(0.203)" }} />
                  )}
                </a>
                <div className="min-w-0">
                  {sites.length > 1 ? (
                    <div className="mb-3">
                      <label className="label">Site que vai no link</label>
                      <select className="input" value={site?.id} onChange={(e) => setSiteSel(e.target.value)}>
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>Modelo {tplName(s.template)} · {new Date(s.updated_at).toLocaleDateString("pt-BR")}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="mb-3 text-[15px]"><b>Modelo {tplName(site!.template)}</b> <span className="text-muted">· salvo em {new Date(site!.updated_at).toLocaleDateString("pt-BR")}</span></p>
                  )}
                  <p className="mb-3 truncate rounded-lg bg-bg px-3 py-2 text-[13px] text-muted">{demoLink}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/painel/sites/${site!.id}`} className="btn-ghost py-2">Editar site</Link>
                    <a href={demoLink} target="_blank" rel="noopener" className="btn-ghost py-2">Abrir demo ↗</a>
                    <button className="btn-ghost py-2" onClick={copyLink}>{linkCopied ? "✓ Link copiado" : "Copiar link"}</button>
                  </div>
                  <Link href={`/painel/sites/novo?lead=${lead.id}`} className="mt-3 inline-block text-[13px] text-muted hover:text-ink">+ Criar com outro modelo</Link>
                </div>
              </div>
            )}
          </div>

          {/* Etapa 3: a mensagem */}
          <div id="mensagem" className={`card scroll-mt-6 p-5 md:p-6 ${hasSite ? "" : "opacity-60"}`}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <StepTitle n={3} done={sent} title="Mensagem com o link" />
              <span className="chip bg-bg text-muted">Idioma: {LANG_NAMES[lang]}</span>
            </div>
            {!hasSite ? (
              <p className="mt-2 text-[14px] text-muted">Disponível depois que o site for criado: a mensagem já sai com o link da demonstração.</p>
            ) : (
              <>
                <p className="mb-4 mt-1 text-[14px] text-muted">As mensagens com link já levam a demonstração. Ajuste se quiser e envie.</p>

                <p className="mb-2 text-[13px] font-semibold">Com o link</p>
                <div className="mb-4 grid gap-2 sm:grid-cols-2">
                  {withLink.map((t) => (
                    <TplButton key={t.id} t={t} active={tplId === t.id} onClick={() => setTplId(t.id)} />
                  ))}
                </div>
                <p className="mb-1 text-[13px] font-semibold">Sem link</p>
                <p className="mb-2 text-[12px] leading-snug text-muted">
                  Para números que nunca falaram com você, o WhatsApp bloqueia com mais facilidade mensagens com link. Mande uma destas primeiro e o link quando a pessoa responder.
                </p>
                <div className="mb-4 grid gap-2 sm:grid-cols-2">
                  {others.map((t) => (
                    <TplButton key={t.id} t={t} active={tplId === t.id} onClick={() => setTplId(t.id)} />
                  ))}
                </div>

                {missingSender && (
                  <p className="mb-3 rounded-xl bg-accent-soft px-3 py-2 text-[13px]">
                    Defina seu nome em <Link href="/painel/configuracoes" className="font-semibold underline">Configurações</Link> para assinar as mensagens ({"{sender}"}).
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
                  {tpl.channel === "whatsapp" && waNumber && (
                    <a className="btn-primary" href={`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" onClick={markSent}>
                      Enviar pelo WhatsApp ↗
                    </a>
                  )}
                  {tpl.channel === "email" && (
                    <a
                      className={`btn-primary ${!email ? "pointer-events-none opacity-50" : ""}`}
                      href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}
                      onClick={markSent}
                    >
                      {email ? "Enviar por e-mail ↗" : "Adicione o e-mail na etapa 1"}
                    </a>
                  )}
                  <button className="btn-ghost" onClick={copy}>{copied ? "✓ Copiado" : "Copiar mensagem"}</button>
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-muted">
                  Ao enviar ou copiar, o cliente passa para “Demo enviada” (mensagem com link) ou “Contatado” (sem link). Mande uma mensagem por negócio, sempre se identifique e respeite quem pedir para não ser contatado.
                  Nem todo número fixo tem WhatsApp; se não abrir, use ligação ou e-mail.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[18px] font-bold">
      <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] tabular-nums ${done ? "bg-ink text-white" : "bg-accent text-white"}`}>{done ? "✓" : n}</span>
      {title}
    </h2>
  );
}

function TplButton({ t, active, onClick }: { t: (typeof OUTREACH)[number]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-xl border p-3 text-left transition ${active ? "border-ink bg-bg" : "border-line hover:border-ink/40"}`}>
      <span className="block text-[14px] font-semibold">{t.channel === "email" ? "✉️" : "💬"} {t.label}</span>
      <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t.hint}</span>
    </button>
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
