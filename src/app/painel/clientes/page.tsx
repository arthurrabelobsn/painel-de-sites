"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, LANG_NAMES, countryByCode } from "@/lib/data/locales";
import { NICHES } from "@/lib/data/niches";
import { PageHeader } from "@/components/PageHeader";
import { Notice } from "@/components/Notice";
import type { PlaceResult, SearchQuota } from "@/app/api/places/route";

// O mapa só carrega no navegador (e só baixa a biblioteca quando a página abre)
const CityMap = dynamic(() => import("@/components/CityMap").then((m) => m.CityMap), {
  ssr: false,
  loading: () => <div className="h-[340px] animate-pulse rounded-xl bg-bg" />,
});

export default function FindClientsPage() {
  const router = useRouter();
  const [niche, setNiche] = useState(NICHES[0].id);
  const [country, setCountry] = useState("PT");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ scanned: number; query: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [quota, setQuota] = useState<SearchQuota | null>(null);

  useEffect(() => {
    fetch("/api/places")
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => q && setQuota(q));
  }, []);

  const remaining = quota ? Math.max(0, quota.limit - quota.used) : null;
  const blocked = !!quota && !quota.unlimited && remaining === 0;

  const c = countryByCode(country);

  async function search(more = false) {
    if (!city.trim()) return setError("Informe a cidade.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, city, pageToken: more ? nextToken : null }),
      });
      const data = await res.json();
      if (data.quota) setQuota(data.quota);
      if (!res.ok) throw new Error(data.error);
      setResults((prev) => {
        const base = more ? prev : [];
        const seen = new Set(base.map((r) => r.place_id));
        return [...base, ...data.results.filter((r: PlaceResult) => !seen.has(r.place_id))];
      });
      setNextToken(data.nextPageToken);
      setMeta((m) => ({ scanned: (more ? m?.scanned ?? 0 : 0) + data.scanned, query: data.query }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na busca.");
    } finally {
      setLoading(false);
    }
  }

  async function save(r: PlaceResult, open: boolean) {
    setBusyId(r.place_id);
    const supabase = createClient();
    const user = (await supabase.auth.getSession()).data.session?.user;
    const { data, error } = await supabase
      .from("leads")
      .upsert(
        {
          user_id: user!.id,
          place_id: r.place_id,
          name: r.name,
          niche,
          country,
          city: city.trim(),
          address: r.address,
          phone: r.phone,
          intl_phone: r.intl_phone,
          maps_url: r.maps_url,
          rating: r.rating,
          reviews: r.reviews,
          hours: r.hours,
        },
        { onConflict: "user_id,place_id" }
      )
      .select("id")
      .single();
    setBusyId(null);
    if (error) return setError(error.message);
    setResults((prev) => prev.map((x) => (x.place_id === r.place_id ? { ...x, saved: true } : x)));
    if (open) router.push(`/painel/leads/${data.id}`);
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Localizar clientes"
        subtitle="Negócios do Google Maps que têm telefone e ainda não têm site. A busca é feita no idioma do país."
      />

      <div className="card mb-6 p-5">
        <label className="label">Nicho</label>
        <div className="mb-5 flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNiche(n.id)}
              className={`rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition ${
                niche === n.id ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
              }`}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(false);
          }}
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div>
            <label className="label" htmlFor="country">País</label>
            <select id="country" className="input" value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); setCustomCity(false); }}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">Cidade</label>
            {customCity ? (
              <div className="flex gap-2">
                <input id="city" autoFocus className="input" placeholder="Digite a cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                <button type="button" className="btn-ghost shrink-0 px-3" onClick={() => { setCustomCity(false); setCity(""); }} title="Voltar para a lista">
                  Lista
                </button>
              </div>
            ) : (
              <select
                id="city"
                className="input"
                value={city}
                onChange={(e) => {
                  if (e.target.value === "__outra") {
                    setCustomCity(true);
                    setCity("");
                  } else setCity(e.target.value);
                }}
              >
                <option value="" disabled>Escolha a cidade…</option>
                <optgroup label="Cidades médias — menos concorrência">
                  {c.midCities.map((x) => <option key={x} value={x}>{x}</option>)}
                </optgroup>
                <optgroup label="Cidades grandes">
                  {c.cities.map((x) => <option key={x} value={x}>{x}</option>)}
                </optgroup>
                <option value="__outra">✏️ Outra cidade…</option>
              </select>
            )}
          </div>
          <button className="btn-accent h-[46px] px-6" disabled={loading || blocked}>
            {loading && !results.length ? "Buscando…" : blocked ? "Limite de hoje atingido" : "Buscar negócios"}
          </button>
        </form>
        {quota && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-bg px-3.5 py-2.5 text-[13px]">
            {quota.unlimited ? (
              <span><b>Buscas ilimitadas</b> nesta conta.</span>
            ) : (
              <>
                <span className="flex gap-1">
                  {Array.from({ length: quota.limit }).map((_, i) => (
                    <span key={i} className={`h-2 w-6 rounded-full ${i < quota.used ? "bg-line" : "bg-accent"}`} />
                  ))}
                </span>
                <span>
                  <b>{remaining} de {quota.limit}</b> buscas restantes hoje
                  <span className="text-muted"> · renova à meia-noite (Brasília). “Carregar mais” não conta.</span>
                </span>
              </>
            )}
          </div>
        )}
        <p className="mt-3 text-[13px] text-muted">
          Idioma das mensagens e do site: <b>{LANG_NAMES[c.lang]}</b>. Dica: cidades médias costumam ter mais negócios sem site que capitais.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="py-1 text-[12px] text-muted">Sugestões:</span>
          {c.midCities.slice(0, 8).map((x) => (
            <button key={x} type="button" onClick={() => { setCustomCity(false); setCity(x); }} className={`rounded-full px-2.5 py-1 text-[12px] transition ${city === x ? "bg-ink text-white" : "bg-bg text-muted hover:text-ink"}`}>{x}</button>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[13px] text-muted">Ou clique numa cidade no mapa:</p>
          <CityMap
            country={c}
            selected={city}
            onSelect={(x) => {
              setCustomCity(false);
              setCity(x);
            }}
          />
        </div>
      </div>

      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      {meta && (
        <p className="mb-3 text-[14px] text-muted">
          Busca <b className="text-ink">“{meta.query}”</b> · {meta.scanned} negócios analisados · <b className="text-ink">{results.length} sem site</b>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => (
          <div key={r.place_id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[17px] font-bold leading-snug">{r.name}</h3>
              {r.rating && (
                <span className="chip shrink-0 bg-bg">★ {r.rating.toFixed(1)} <span className="ml-1 text-muted">({r.reviews})</span></span>
              )}
            </div>
            <p className="mt-1 text-[14px] text-muted">{r.address}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
              <span>📞 {r.phone}</span>
              {r.maps_url && <a href={r.maps_url} target="_blank" rel="noopener" className="text-accent hover:underline">Ver no Maps ↗</a>}
            </div>
            <div className="mt-4 flex gap-2 pt-1">
              {r.saved ? (
                <span className="chip bg-ok-soft text-ok">✓ Salvo</span>
              ) : (
                <button className="btn-ghost py-2" disabled={busyId === r.place_id} onClick={() => save(r, false)}>Salvar</button>
              )}
              <button className="btn-primary py-2" disabled={busyId === r.place_id} onClick={() => save(r, true)}>
                Abordar e gerar site →
              </button>
            </div>
          </div>
        ))}
      </div>

      {meta && results.length === 0 && !loading && (
        <div className="card p-8 text-center text-muted">Nenhum negócio sem site nessa busca. Tente outra cidade ou carregue mais resultados.</div>
      )}

      {nextToken && (
        <div className="mt-6 text-center">
          <button className="btn-ghost" disabled={loading} onClick={() => search(true)}>
            {loading ? "Carregando…" : "Carregar mais resultados"}
          </button>
        </div>
      )}
    </div>
  );
}
