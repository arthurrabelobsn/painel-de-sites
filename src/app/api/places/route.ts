import { NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { countryByCode } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";

type GooglePlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
};

export type PlaceResult = {
  place_id: string;
  name: string;
  address: string;
  phone: string;
  intl_phone: string;
  rating: number | null;
  reviews: number | null;
  maps_url: string;
  hours: string[];
  saved: boolean;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.regularOpeningHours.weekdayDescriptions",
  "nextPageToken",
].join(",");

const MAX_PAGES_PER_CLICK = 3; // até 60 negócios analisados por clique

/** Buscas novas por usuário por dia ("Carregar mais" não conta) */
const DAILY_LIMIT = Number(process.env.DAILY_SEARCH_LIMIT ?? 3);

/** E-mails sem limite (ex.: o seu), separados por vírgula */
function isExempt(email?: string | null) {
  const list = (process.env.SEARCH_LIMIT_EXEMPT_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export type SearchQuota = { used: number; limit: number; unlimited: boolean };

/** Quantas buscas o usuário já fez hoje */
export async function GET() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { data } = await supabase.rpc("searches_today");
  const quota: SearchQuota = { used: (data as number) ?? 0, limit: DAILY_LIMIT, unlimited: isExempt(user.email) };
  return NextResponse.json(quota);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "Falta configurar GOOGLE_PLACES_API_KEY nas variáveis de ambiente." },
      { status: 500 }
    );

  const { niche: nicheId, country: countryCode, city, pageToken } = await req.json();
  if (!city?.trim()) return NextResponse.json({ error: "Informe a cidade." }, { status: 400 });

  // Limite diário: só buscas novas que DERAM CERTO contam ("Carregar mais" não conta).
  // Aqui só verifica; o consumo acontece depois que o Google responde com sucesso.
  const unlimited = isExempt(user.email);
  const counts = !pageToken && !unlimited;
  let used: number | null = null;
  if (counts) {
    const { data, error } = await supabase.rpc("searches_today");
    if (error)
      return NextResponse.json(
        { error: "Não foi possível verificar o limite de buscas. Rode o arquivo supabase/migrations/002_limite_buscas.sql no Supabase." },
        { status: 500 }
      );
    used = (data as number) ?? 0;
    if (used >= DAILY_LIMIT)
      return NextResponse.json(
        {
          error: `Você já usou suas ${DAILY_LIMIT} buscas de hoje. O limite renova à meia-noite (horário de Brasília).`,
          quota: { used, limit: DAILY_LIMIT, unlimited } satisfies SearchQuota,
        },
        { status: 429 }
      );
  }

  const country = countryByCode(countryCode);
  const niche = nicheById(nicheId);
  const textQuery = `${niche.search[country.lang]} ${city.trim()}`;

  const results: PlaceResult[] = [];
  let token: string | undefined = pageToken || undefined;
  let scanned = 0;

  for (let page = 0; page < MAX_PAGES_PER_CLICK; page++) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: country.lang,
        regionCode: country.code,
        pageSize: 20,
        ...(token ? { pageToken: token } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (page > 0) break; // já temos resultados das páginas anteriores
      const status = data?.error?.status;
      const msg = data?.error?.message ?? "Erro ao consultar o Google.";
      const friendly =
        status === "PERMISSION_DENIED"
          ? "O Google recusou a chave: confira se a “Places API (New)” está ativada no mesmo projeto da chave, se a chave permite essa API e se o faturamento/teste do Google Cloud foi concluído."
          : status === "RESOURCE_EXHAUSTED"
            ? "Cota diária do Google atingida. A busca volta a funcionar amanhã."
            : `Google Places: ${msg}`;
      const quota: SearchQuota | null = used === null ? null : { used, limit: DAILY_LIMIT, unlimited };
      return NextResponse.json({ error: friendly, quota }, { status: 502 });
    }

    const places: GooglePlace[] = data.places ?? [];
    scanned += places.length;
    for (const p of places) {
      const phone = p.nationalPhoneNumber || p.internationalPhoneNumber;
      if (p.websiteUri || !phone) continue; // queremos: sem site e com contato
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
      results.push({
        place_id: p.id,
        name: p.displayName?.text ?? "Sem nome",
        address: p.formattedAddress ?? "",
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? "",
        intl_phone: p.internationalPhoneNumber ?? "",
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
        maps_url: p.googleMapsUri ?? "",
        hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
        saved: false,
      });
    }

    token = data.nextPageToken;
    if (!token || results.length >= 15) break;
  }

  // Marca os que o usuário já salvou
  if (results.length) {
    const { data: saved } = await supabase
      .from("leads")
      .select("place_id")
      .in(
        "place_id",
        results.map((r) => r.place_id)
      );
    const set = new Set((saved ?? []).map((s) => s.place_id));
    results.forEach((r) => (r.saved = set.has(r.place_id)));
  }

  // Busca deu certo: agora sim consome 1 do limite diário
  if (counts) {
    const { data } = await supabase.rpc("consume_search", { p_limit: DAILY_LIMIT });
    used = (data as number | null) ?? DAILY_LIMIT;
  }

  const quota: SearchQuota | null = used === null ? null : { used, limit: DAILY_LIMIT, unlimited };
  return NextResponse.json({ results, nextPageToken: token ?? null, scanned, query: textQuery, quota });
}
