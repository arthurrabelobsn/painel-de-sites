"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { renderSite } from "@/lib/templates/render";
import {
  BLOCK_LABELS,
  BLOCK_POSITIONS,
  POSITION_LABELS,
  SECTION_KEYS,
  SECTION_LABELS,
  TEMPLATES,
  type Block,
  type BlockPosition,
  type ServiceItem,
  type SiteData,
  type TemplateId,
} from "@/lib/templates/types";
import { LANG_NAMES } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";
import { photosFor, photoUrl } from "@/lib/data/photos";
import { downloadHtml, downloadZip, exportPdf, resizeImage } from "@/lib/export";
import { Notice } from "@/components/Notice";

type Tab = "modelo" | "textos" | "contato" | "visual" | "ia";

const PALETTES: [string, string, string][] = [
  ["#1d6fe0", "#0b1f3a", "#e8f1ff"],
  ["#ff5a1f", "#1a1410", "#fff1ea"],
  ["#14a37f", "#0c2420", "#e4f6f0"],
  ["#c2577a", "#2a1520", "#fbeef2"],
  ["#b8892d", "#141210", "#f5efe4"],
  ["#6d4aff", "#16112e", "#efebff"],
  ["#e0482b", "#141820", "#f2f4f7"],
  ["#3f8f3a", "#12200f", "#eef6e8"],
];

export function Editor({
  initial,
  siteId,
  leadId,
  leadName,
  hasAI,
}: {
  initial: SiteData;
  siteId: string | null;
  leadId: string | null;
  leadName: string;
  hasAI: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [d, setD] = useState<SiteData>(initial);
  const [tab, setTab] = useState<Tab>("modelo");
  const [showOthers, setShowOthers] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [dirty, setDirty] = useState(!siteId);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiLog, setAiLog] = useState<{ req: string; summary: string; ok: boolean }[]>([]);
  const [undoStack, setUndoStack] = useState<SiteData[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  // Prévia e miniaturas usam uma cópia com atraso: digitar não recarrega 4 iframes a cada tecla
  const [deb, setDeb] = useState<SiteData>(initial);
  useEffect(() => {
    const t = setTimeout(() => setDeb(d), 450);
    return () => clearTimeout(t);
  }, [d]);
  const previewHtml = useMemo(() => renderSite(deb), [deb]);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function set<K extends keyof SiteData>(k: K, v: SiteData[K]) {
    setD((p) => ({ ...p, [k]: v }));
    setDirty(true);
  }

  function flash(kind: "ok" | "error", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 4000);
  }

  async function save(): Promise<string | null> {
    setBusy("save");
    const html = renderSite(d);
    const user = (await supabase.auth.getSession()).data.session?.user;
    let id = siteId;
    if (id) {
      const { error } = await supabase
        .from("sites")
        .update({ data: d, html, template: d.template, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        setBusy(null);
        flash("error", error.message);
        return null;
      }
    } else {
      const { data, error } = await supabase
        .from("sites")
        .insert({ user_id: user!.id, lead_id: leadId, template: d.template, data: d, html })
        .select("id")
        .single();
      if (error) {
        setBusy(null);
        flash("error", error.message);
        return null;
      }
      id = data.id;
    }
    setBusy(null);
    setDirty(false);
    flash("ok", "Site salvo.");
    if (!siteId && id) router.replace(`/painel/sites/${id}`);
    else router.refresh();
    return id;
  }

  async function copyDemoLink() {
    let id = siteId;
    if (!id || dirty) id = await save();
    if (!id) return;
    await navigator.clipboard.writeText(`${origin}/demo/${id}`);
    flash("ok", "Link da demonstração copiado.");
  }

  async function runPdf() {
    setBusy("pdf");
    try {
      await exportPdf(d);
    } catch (e) {
      flash("error", "Não foi possível gerar o PDF. " + (e instanceof Error ? e.message : ""));
    }
    setBusy(null);
  }

  async function runAI(text: string) {
    const req = text.trim();
    if (!req) return;
    setBusy("ai");
    try {
      // fotos e logo não vão para a IA (pesadas e desnecessárias)
      const site = { ...d, logo: "", heroImage: "", aboutImage: "" };
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, request: req }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      const changed = out.patch && Object.keys(out.patch).length > 0;
      if (changed) {
        setUndoStack((u) => [...u.slice(-19), d]);
        setD((p) => ({ ...p, ...out.patch }));
        setDirty(true);
      }
      setAiLog((l) => [...l, { req, summary: out.summary, ok: changed }]);
      setAiInput("");
    } catch (e) {
      setAiLog((l) => [...l, { req, summary: e instanceof Error ? e.message : "Erro na IA.", ok: false }]);
    }
    setBusy(null);
  }

  function undo() {
    setUndoStack((u) => {
      if (!u.length) return u;
      setD(u[u.length - 1]);
      setDirty(true);
      return u.slice(0, -1);
    });
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    set("blocks", (d.blocks ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function moveBlock(id: string, dir: -1 | 1) {
    const list = [...(d.blocks ?? [])];
    const i = list.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set("blocks", list);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "heroImage" | "aboutImage") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await resizeImage(file, field === "logo" ? 400 : 1600, field === "logo" ? "image/png" : "image/jpeg");
    set(field, url);
    e.target.value = "";
  }

  async function deleteSite() {
    if (!siteId || !confirm("Excluir este site? O link de demonstração deixa de funcionar.")) return;
    await supabase.from("sites").delete().eq("id", siteId);
    router.push(leadId ? `/painel/leads/${leadId}` : "/painel/sites");
    router.refresh();
  }

  const niche = nicheById(d.nicheId);

  return (
    <div className="-m-5 md:-m-10">
      {/* Barra superior */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/95 px-5 py-3 backdrop-blur md:px-8">
        <div className="min-w-0">
          <Link href={leadId ? `/painel/leads/${leadId}` : "/painel/sites"} className="text-[13px] text-muted hover:text-ink">
            ← {leadName}
          </Link>
          <p className="truncate text-[15px] font-bold">
            Site de demonstração {dirty && <span className="ml-1 text-[12px] font-medium text-accent">● não salvo</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost py-2" onClick={copyDemoLink} disabled={!!busy}>🔗 Copiar link da demo</button>
          <button className="btn-ghost py-2" onClick={runPdf} disabled={!!busy}>{busy === "pdf" ? "Gerando PDF…" : "📄 Exportar PDF"}</button>
          <button className="btn-ghost py-2" onClick={() => setShowPublish(true)}>🚀 Publicar</button>
          <button className="btn-primary py-2" onClick={save} disabled={!!busy}>{busy === "save" ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>

      {msg && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 shadow-lg">
          <Notice kind={msg.kind}>{msg.text}</Notice>
        </div>
      )}

      <div className="grid lg:grid-cols-[400px_1fr]">
        {/* Painel de edição */}
        <div className="border-line lg:h-[calc(100vh-61px)] lg:overflow-y-auto lg:border-r">
          <div className="flex gap-1 border-b border-line px-4 pt-3">
            {(
              [
                ["modelo", "Modelo"],
                ["textos", "Textos"],
                ["contato", "Contato"],
                ["visual", "Visual"],
                ["ia", "✨ IA"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`-mb-px border-b-2 px-3 py-2.5 text-[14px] font-medium transition ${tab === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-5 p-5">
            {tab === "modelo" && (
              <>
                <p className="text-[14px] text-muted">
                  {niche.emoji} {niche.label} · textos em <b className="text-ink">{LANG_NAMES[d.lang]}</b>. Todos os modelos usam os mesmos dados — troque à vontade.
                </p>
                {(() => {
                  const own = TEMPLATES.filter((t) => t.niche === d.nicheId);
                  const general = TEMPLATES.filter((t) => !t.niche);
                  const others = TEMPLATES.filter((t) => t.niche && t.niche !== d.nicheId);
                  const card = (t: (typeof TEMPLATES)[number]) => (
                    <button key={t.id} onClick={() => set("template", t.id as TemplateId)} className={`block w-full overflow-hidden rounded-2xl border-2 text-left transition ${d.template === t.id ? "border-ink" : "border-line hover:border-ink/40"}`}>
                      <Thumb data={deb} template={t.id} />
                      <div className="border-t border-line bg-surface p-3">
                        <p className="font-semibold">{t.name} {d.template === t.id && <span className="text-accent">✓</span>}</p>
                        <p className="text-[13px] text-muted">{t.description}</p>
                      </div>
                    </button>
                  );
                  return (
                    <>
                      {own.length > 0 && (
                        <>
                          <h3 className="pt-1 text-[15px] font-semibold">Feito para {niche.label.toLowerCase()}</h3>
                          {own.map(card)}
                        </>
                      )}
                      <h3 className="pt-3 text-[15px] font-semibold">Modelos gerais</h3>
                      {general.map(card)}
                      <button onClick={() => setShowOthers((v) => !v)} className="btn-ghost w-full justify-center">
                        {showOthers ? "Esconder modelos de outros nichos" : `Ver modelos de outros nichos (${others.length})`}
                      </button>
                      {showOthers && others.map((t) => card({ ...t, description: `${nicheById(t.niche!).emoji} ${nicheById(t.niche!).label} · ${t.description}` }))}
                    </>
                  );
                })()}
              </>
            )}

            {tab === "textos" && (
              <>
                <Field label="Nome do negócio" value={d.name} onChange={(v) => set("name", v)} />
                <Field label="Título principal" value={d.headline} onChange={(v) => set("headline", v)} />
                <Field label="Subtítulo" value={d.sub} onChange={(v) => set("sub", v)} area />
                <Field label="Sobre o negócio" value={d.about} onChange={(v) => set("about", v)} area rows={4} />
                <ItemsEditor label="Serviços" items={d.services} min={2} max={6} onChange={(v) => set("services", v)} />
                <ItemsEditor label="Por que escolher (3 itens)" items={d.benefits} min={3} max={3} onChange={(v) => set("benefits", v)} />

                <div className="border-t border-line pt-5">
                  <label className="label">Seções do modelo</label>
                  <div className="space-y-2">
                    {SECTION_KEYS.map((k) => (
                      <Toggle
                        key={k}
                        label={`Mostrar “${SECTION_LABELS[k]}”`}
                        checked={!d.hidden?.[k]}
                        onChange={(v) => set("hidden", { ...(d.hidden ?? {}), [k]: !v })}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-line pt-5">
                  <label className="label">Seções extras</label>
                  {(d.blocks ?? []).length === 0 ? (
                    <p className="text-[13px] text-muted">
                      Nenhuma ainda. Peça na aba <button className="font-semibold text-accent underline" onClick={() => setTab("ia")}>✨ IA</button>: “adicione perguntas frequentes”, “crie uma seção de preços”…
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(d.blocks ?? []).map((b, i, arr) => (
                        <div key={b.id} className="rounded-xl border border-line bg-surface p-2.5">
                          <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted">
                            <span className="font-semibold text-ink">{BLOCK_LABELS[b.type]}</span>
                            <span className="flex gap-1">
                              <button className="px-1 hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => moveBlock(b.id, -1)} aria-label="Subir">↑</button>
                              <button className="px-1 hover:text-ink disabled:opacity-30" disabled={i === arr.length - 1} onClick={() => moveBlock(b.id, 1)} aria-label="Descer">↓</button>
                              <button className="px-1 hover:text-danger" onClick={() => set("blocks", arr.filter((x) => x.id !== b.id))} aria-label="Remover">✕</button>
                            </span>
                          </div>
                          <input className="input mb-1.5 py-1.5 text-[14px] font-semibold" value={b.title ?? ""} placeholder="Título da seção" onChange={(e) => updateBlock(b.id, { title: e.target.value })} />
                          {b.type !== "custom" && (
                            <textarea className="input mb-1.5 py-1.5 text-[13px]" rows={2} value={b.text ?? ""} placeholder="Texto" onChange={(e) => updateBlock(b.id, { text: e.target.value })} />
                          )}
                          {b.items && b.items.length > 0 && (
                            <div className="mb-1.5 space-y-1">
                              {b.items.map((it, j) => (
                                <div key={j} className="flex gap-1">
                                  <input className="input py-1 text-[13px]" value={it.title} onChange={(e) => updateBlock(b.id, { items: b.items!.map((x, k) => (k === j ? { ...x, title: e.target.value } : x)) })} />
                                  {b.type === "pricing" && (
                                    <input className="input w-24 py-1 text-[13px]" value={it.price ?? ""} placeholder="Preço" onChange={(e) => updateBlock(b.id, { items: b.items!.map((x, k) => (k === j ? { ...x, price: e.target.value } : x)) })} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <select className="input py-1.5 text-[13px]" value={b.position} onChange={(e) => updateBlock(b.id, { position: e.target.value as BlockPosition })}>
                            {BLOCK_POSITIONS.map((p) => <option key={p} value={p}>{POSITION_LABELS[p]}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "contato" && (
              <>
                <Field label="Telefone (como aparece)" value={d.phone} onChange={(v) => set("phone", v)} />
                <Field label="Telefone internacional (para o botão ligar)" value={d.intlPhone} onChange={(v) => set("intlPhone", v)} />
                <Field label="WhatsApp (só números com DDI; vazio = sem botão)" value={d.whatsapp} onChange={(v) => set("whatsapp", v.replace(/\D/g, ""))} />
                <Field label="E-mail" value={d.email} onChange={(v) => set("email", v)} />
                <Field label="Endereço" value={d.address} onChange={(v) => set("address", v)} area />
                <Field label="Cidade" value={d.city} onChange={(v) => set("city", v)} />
                <Field
                  label="Horário (uma linha por dia, ex.: Monday: 9:00 – 18:00)"
                  value={d.hours.join("\n")}
                  onChange={(v) => set("hours", v.split("\n").filter((x) => x.trim()))}
                  area
                  rows={7}
                />
                <Toggle label="Mostrar mapa" checked={d.showMap} onChange={(v) => set("showMap", v)} />
                <Toggle label={`Mostrar nota do Google${d.rating ? ` (★ ${d.rating})` : ""}`} checked={d.showRating} onChange={(v) => set("showRating", v)} disabled={!d.rating} />
              </>
            )}

            {tab === "visual" && (
              <>
                <div>
                  <label className="label">Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-line bg-surface">
                      {d.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.logo} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-lg text-sm font-black text-white" style={{ background: d.primary }}>
                          {d.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="btn-ghost cursor-pointer py-1.5 text-[13px]">
                        Enviar logo
                        <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e, "logo")} />
                      </label>
                      {d.logo && <button className="text-[13px] text-muted hover:text-ink" onClick={() => set("logo", "")}>Usar monograma</button>}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[12px] text-muted">Sem logo, o site usa as iniciais do negócio. Dica: pegue a logo do Instagram ou Facebook do negócio.</p>
                </div>

                <PhotoPicker
                  label="Foto do topo"
                  niche={d.nicheId}
                  upload={d.heroImage}
                  chosen={d.heroPhoto}
                  fallbackIndex={0}
                  onPick={(id) => setD((x) => ({ ...x, heroPhoto: id, heroImage: "" }))}
                  onUpload={(e) => onUpload(e, "heroImage")}
                  onClearUpload={() => set("heroImage", "")}
                />
                <PhotoPicker
                  label="Foto da seção “sobre”"
                  niche={d.nicheId}
                  upload={d.aboutImage ?? ""}
                  chosen={d.aboutPhoto}
                  fallbackIndex={1}
                  onPick={(id) => setD((x) => ({ ...x, aboutPhoto: id, aboutImage: "" }))}
                  onUpload={(e) => onUpload(e, "aboutImage")}
                  onClearUpload={() => set("aboutImage", "")}
                  note="Aparece nos modelos que têm foto no “sobre”."
                />

                <div>
                  <label className="label">Paletas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[niche.palette, ...PALETTES].slice(0, 8).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setD((x) => ({ ...x, primary: p[0], dark: p[1], light: p[2] }));
                          setDirty(true);
                        }}
                        className="flex h-10 overflow-hidden rounded-lg border border-line hover:ring-2 hover:ring-ink/20"
                        title={i === 0 ? "Paleta do nicho" : ""}
                      >
                        {p.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ColorField label="Principal" value={d.primary} onChange={(v) => set("primary", v)} />
                  <ColorField label="Escura" value={d.dark} onChange={(v) => set("dark", v)} />
                  <ColorField label="Clara" value={d.light} onChange={(v) => set("light", v)} />
                </div>
                <Toggle label="Selo “demonstração” no canto" checked={d.showDemoBadge} onChange={(v) => set("showDemoBadge", v)} />
              </>
            )}

            {tab === "ia" && (
              <>
                <div className="rounded-2xl bg-bg p-4 text-[13px] leading-relaxed">
                  Peça em português o que quiser mudar. A IA altera textos, cores e modelo, esconde seções e <b>cria seções novas</b>
                  (perguntas frequentes, preços, passo a passo, chamadas…). Os textos do site saem em <b>{LANG_NAMES[d.lang]}</b>.
                </div>
                {!hasAI ? (
                  <Notice kind="info">
                    Conecte sua chave grátis do Gemini em <Link href="/painel/configuracoes" className="font-semibold text-ink underline">Configurações</Link> para usar.
                  </Notice>
                ) : (
                  <>
                    {aiLog.length > 0 && (
                      <div className="space-y-2">
                        {aiLog.map((m, i) => (
                          <div key={i} className="space-y-1.5">
                            <p className="ml-6 rounded-xl rounded-br-sm bg-ink px-3 py-2 text-[13px] text-white">{m.req}</p>
                            <p className={`mr-6 rounded-xl rounded-bl-sm px-3 py-2 text-[13px] ${m.ok ? "bg-ok-soft text-ok" : "bg-bg text-muted"}`}>
                              {m.ok ? "✓ " : ""}{m.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        runAI(aiInput);
                      }}
                    >
                      <textarea
                        className="input min-h-24"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            runAI(aiInput);
                          }
                        }}
                        placeholder="Ex.: adicione uma seção de perguntas frequentes sobre emergências e preços; deixe o título mais direto"
                      />
                      <div className="mt-2 flex gap-2">
                        <button className="btn-accent flex-1" disabled={!!busy || !aiInput.trim()}>
                          {busy === "ai" ? "Aplicando…" : "✨ Aplicar"}
                        </button>
                        {undoStack.length > 0 && (
                          <button type="button" className="btn-ghost" onClick={undo} disabled={!!busy} title="Desfazer a última alteração da IA">
                            ↩ Desfazer
                          </button>
                        )}
                      </div>
                    </form>
                    <div>
                      <p className="mb-1.5 text-[12px] font-medium text-muted">Sugestões</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Reescreva todos os textos para ficarem específicos deste negócio e desta cidade",
                          "Adicione uma seção de perguntas frequentes com 5 perguntas comuns deste nicho",
                          "Adicione uma seção de preços com 3 opções (use preços de exemplo para eu editar)",
                          "Adicione um passo a passo de como funciona o atendimento",
                          "Adicione uma faixa de chamada para ação antes do contato",
                          "Deixe o visual mais premium: ajuste as cores e o tom dos textos",
                        ].map((sug) => (
                          <button key={sug} type="button" disabled={!!busy} onClick={() => runAI(sug)} className="rounded-full border border-line bg-surface px-2.5 py-1 text-left text-[12px] hover:border-ink disabled:opacity-50">
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[12px] text-muted">A IA nunca inventa avaliações, prêmios ou dados de contato. Revise antes de enviar ao cliente.</p>
                  </>
                )}
              </>
            )}

            <div className="space-y-2 border-t border-line pt-5">
              <p className="text-[13px] font-medium text-muted">Arquivos</p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost py-2 text-[13px]" onClick={() => downloadZip(d)}>Baixar .zip</button>
                <button className="btn-ghost py-2 text-[13px]" onClick={() => downloadHtml(d)}>Baixar HTML</button>
                {siteId && <button className="py-2 text-[13px] text-danger hover:underline" onClick={deleteSite}>Excluir site</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Prévia */}
        <div className="bg-[#e9e6de] p-4 lg:h-[calc(100vh-61px)] lg:overflow-hidden lg:p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex rounded-xl border border-line bg-surface p-1">
              {(["desktop", "mobile"] as const).map((x) => (
                <button key={x} onClick={() => setDevice(x)} className={`rounded-lg px-3 py-1.5 text-[13px] font-medium ${device === x ? "bg-ink text-white" : "text-muted"}`}>
                  {x === "desktop" ? "Computador" : "Celular"}
                </button>
              ))}
            </div>
            {siteId && (
              <a href={`/demo/${siteId}`} target="_blank" rel="noopener" className="text-[13px] font-medium text-muted hover:text-ink">
                Abrir demo ↗
              </a>
            )}
          </div>
          <div className="mx-auto h-[70vh] overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all lg:h-[calc(100%-48px)]" style={{ maxWidth: device === "mobile" ? 390 : "100%" }}>
            <iframe title="Prévia do site" srcDoc={previewHtml} className="h-full w-full" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
          </div>
        </div>
      </div>

      {showPublish && <PublishModal data={d} onClose={() => setShowPublish(false)} />}
    </div>
  );
}

const Thumb = memo(function Thumb({ data, template }: { data: SiteData; template: TemplateId }) {
  const html = useMemo(() => renderSite({ ...data, template, showDemoBadge: false }, { forPdf: true }), [data, template]);
  return (
    <div className="pointer-events-none relative h-[190px] overflow-hidden bg-white">
      <iframe title="miniatura" srcDoc={html} tabIndex={-1} sandbox="" loading="lazy" className="absolute left-0 top-0 origin-top-left" style={{ width: 1280, height: 860, transform: "scale(0.28)" }} />
    </div>
  );
});

/** Escolha de foto: as do banco do nicho, nenhuma (desenho do ofício) ou uma enviada pelo usuário */
function PhotoPicker({
  label, niche, upload, chosen, fallbackIndex, onPick, onUpload, onClearUpload, note,
}: {
  label: string;
  niche: string;
  upload: string;
  chosen: string | undefined;
  fallbackIndex: number;
  onPick: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearUpload: () => void;
  note?: string;
}) {
  const list = photosFor(niche);
  const current = upload ? "upload" : chosen === undefined ? (list[fallbackIndex]?.id ?? "") : chosen;
  const tile = "relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition";
  const on = "border-ink";
  const off = "border-transparent hover:border-ink/30";
  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {upload && (
          <button className={`${tile} ${on}`} onClick={() => {}} title="Foto enviada">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={upload} alt="Foto enviada" className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">Sua foto</span>
          </button>
        )}
        {list.map((ph) => (
          <button key={ph.id} className={`${tile} ${current === ph.id ? on : off} bg-surface`} onClick={() => onPick(ph.id)} title={ph.alt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(ph.id, 320)} alt={ph.alt} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
        <button className={`${tile} ${current === "" ? on : off} grid place-items-center bg-surface text-[12px] text-muted`} onClick={() => onPick("")}>
          Sem foto
        </button>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <label className="btn-ghost cursor-pointer py-1.5 text-[13px]">
          {upload ? "Trocar minha foto" : "Enviar foto do negócio"}
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </label>
        {upload && <button className="text-[13px] text-muted hover:text-ink" onClick={onClearUpload}>Remover minha foto</button>}
      </div>
      <p className="mt-1.5 text-[12px] text-muted">{note ?? "Fotos do Unsplash, livres para uso comercial. A foto do próprio negócio sempre converte melhor."}</p>
    </div>
  );
}

function Field({ label, value, onChange, area, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; rows?: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      {area ? (
        <textarea className="input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface p-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0" />
        <span className="font-mono text-[12px] text-muted">{value}</span>
      </label>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-3 text-[14px] ${disabled ? "opacity-50" : ""}`}>
      {label}
      <input type="checkbox" className="h-4 w-4 accent-[#15140f]" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function ItemsEditor({ label, items, min, max, onChange }: { label: string; items: ServiceItem[]; min: number; max: number; onChange: (v: ServiceItem[]) => void }) {
  const update = (i: number, k: keyof ServiceItem, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-2.5">
            <div className="flex gap-2">
              <input className="input py-1.5 text-[14px] font-semibold" value={it.title} onChange={(e) => update(i, "title", e.target.value)} />
              {items.length > min && (
                <button className="px-1 text-muted hover:text-danger" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
              )}
            </div>
            <input className="input mt-1.5 py-1.5 text-[13px]" value={it.desc} onChange={(e) => update(i, "desc", e.target.value)} />
          </div>
        ))}
      </div>
      {items.length < max && (
        <button className="mt-2 text-[13px] font-medium text-accent hover:underline" onClick={() => onChange([...items, { title: "…", desc: "…" }])}>
          + Adicionar
        </button>
      )}
    </div>
  );
}

function PublishModal({ data, onClose }: { data: SiteData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[20px] font-black">Publicar o site do cliente</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">✕</button>
        </div>
        <p className="mb-4 text-[14px] leading-relaxed text-muted">
          Recomendado: <b className="text-ink">Cloudflare Pages</b>. É grátis (inclusive para uso comercial), aceita HTML puro e domínio próprio — o cliente paga só o domínio.
        </p>
        <ol className="mb-5 space-y-3 text-[14px]">
          {[
            <>Baixe o pacote do site: <button className="font-semibold text-accent underline" onClick={() => downloadZip(data)}>baixar .zip</button> (o selo de demonstração sai automaticamente).</>,
            <>Entre em <a className="font-semibold underline" href="https://dash.cloudflare.com" target="_blank" rel="noopener">dash.cloudflare.com</a> → Workers & Pages → Create → Pages → <b>Upload assets</b>.</>,
            <>Dê um nome ao projeto (ex.: o nome do negócio) e arraste o .zip. Em segundos o site fica no ar em <code>nome.pages.dev</code>.</>,
            <>Em <b>Custom domains</b>, conecte o domínio do cliente (comprado na Cloudflare, Namecheap, GoDaddy etc.).</>,
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-bold text-white">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <p className="rounded-xl bg-bg p-3 text-[13px] text-muted">
          Alternativa: <a className="font-semibold text-ink underline" href="https://app.netlify.com/drop" target="_blank" rel="noopener">Netlify Drop</a> — descompacte o .zip e arraste a pasta. Em uma próxima versão dá para publicar direto daqui pela API da Cloudflare.
        </p>
      </div>
    </div>
  );
}
