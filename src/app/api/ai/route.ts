import { NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { type Lang } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";
import { photosFor } from "@/lib/data/photos";
import {
  BLOCK_POSITIONS,
  BLOCK_TYPES,
  SECTION_KEYS,
  TEMPLATES,
  type Block,
  type BlockItem,
  type SiteData,
} from "@/lib/templates/types";
import { sanitizeHtml } from "@/lib/templates/sanitize";

// Ordem de tentativa: o modelo configurado e, se o Google tiver aposentado ele, os seguintes.
// "gemini-flash-latest" aponta sempre para o Flash mais recente.
const MODELS = [
  ...new Set([process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-flash-latest"].filter(Boolean) as string[]),
];

/** Erro que indica modelo aposentado/inexistente: vale tentar o próximo */
const isModelGone = (status?: number, msg = "") =>
  status === 404 || /no longer available|not found|is not supported|deprecated/i.test(msg);

const LANG_EN: Record<Lang, string> = {
  en: "English (UK/Ireland)",
  de: "German",
  fr: "French",
  es: "Spanish (Spain)",
  it: "Italian",
  pt: "European Portuguese (Portugal)",
  nl: "Dutch",
};

const HEX = /^#[0-9a-f]{6}$/i;
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

/** Aceita só o que tem formato válido; o resto é ignorado */
function cleanPatch(raw: Record<string, unknown>, current: SiteData) {
  const set = (raw.set ?? {}) as Record<string, unknown>;
  const patch: Partial<SiteData> = {};

  const text: [keyof SiteData, number][] = [
    ["name", 80], ["headline", 110], ["sub", 240], ["about", 700],
    ["phone", 40], ["email", 120], ["address", 200], ["city", 80],
  ];
  for (const [k, max] of text) {
    const v = str(set[k], max);
    if (v !== undefined) (patch as Record<string, unknown>)[k] = v;
  }
  for (const k of ["primary", "dark", "light"] as const) {
    if (typeof set[k] === "string" && HEX.test(set[k] as string)) patch[k] = set[k] as string;
  }
  for (const k of ["showMap", "showRating"] as const) {
    if (typeof set[k] === "boolean") patch[k] = set[k] as boolean;
  }
  if (typeof set.template === "string" && TEMPLATES.some((t) => t.id === set.template)) patch.template = set.template as SiteData["template"];
  // topo: aviso acima do título (string vazia remove) e fotos de banco do nicho
  if (typeof set.heroNote === "string") patch.heroNote = set.heroNote.trim().slice(0, 120);
  const ids = photosFor(current.nicheId).map((p) => p.id);
  for (const k of ["heroPhoto", "aboutPhoto"] as const) {
    const v = set[k];
    if (v === "none" || v === "") patch[k] = "";
    else if (typeof v === "string" && ids.includes(v)) patch[k] = v;
  }
  if (Array.isArray(set.hours)) patch.hours = (set.hours as unknown[]).map((h) => str(h, 80)).filter(Boolean).slice(0, 7) as string[];

  const items = (arr: unknown, min: number, max: number) => {
    if (!Array.isArray(arr)) return undefined;
    const out = arr
      .map((it) => ({ title: str((it as { title?: unknown })?.title, 70), desc: str((it as { desc?: unknown })?.desc, 200) ?? "" }))
      .filter((it): it is { title: string; desc: string } => !!it.title)
      .slice(0, max);
    return out.length >= min ? out : undefined;
  };
  const services = items(set.services, 1, 8);
  if (services) patch.services = services;
  const benefits = items(set.benefits, 3, 3);
  if (benefits) patch.benefits = benefits;

  // seções fixas escondidas
  if (raw.hidden && typeof raw.hidden === "object") {
    const hidden = { ...(current.hidden ?? {}) };
    for (const k of SECTION_KEYS) {
      const v = (raw.hidden as Record<string, unknown>)[k];
      if (typeof v === "boolean") hidden[k] = v;
    }
    patch.hidden = hidden;
  }

  // seções extras: a IA devolve a lista completa
  if (Array.isArray(raw.blocks)) {
    patch.blocks = (raw.blocks as Record<string, unknown>[])
      .slice(0, 10)
      .map((b, i): Block | null => {
        const type = BLOCK_TYPES.find((t) => t === b?.type);
        if (!type) return null;
        const position = BLOCK_POSITIONS.find((p) => p === b.position) ?? "before-contact";
        const its = Array.isArray(b.items)
          ? (b.items as Record<string, unknown>[])
              .map((it): BlockItem | null => {
                const title = str(it?.title, 120);
                return title ? { title, desc: str(it.desc, 400), price: str(it.price, 30) } : null;
              })
              .filter((x): x is BlockItem => !!x)
              .slice(0, 12)
          : undefined;
        return {
          id: str(b.id, 40) ?? `b${Date.now().toString(36)}${i}`,
          type,
          position,
          title: str(b.title, 120),
          text: str(b.text, type === "text" ? 2000 : 400),
          button: str(b.button, 40),
          items: its,
          html: type === "custom" ? sanitizeHtml(String(b.html ?? "")) : undefined,
        };
      })
      .filter((b): b is Block => !!b);
  }

  return patch;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("gemini_api_key").eq("id", user.id).single();
  const key = profile?.gemini_api_key || process.env.GEMINI_API_KEY;
  if (!key)
    return NextResponse.json({ error: "Configure sua chave grátis do Gemini em Configurações para usar a IA." }, { status: 400 });

  const { site, request: userRequest } = (await req.json()) as { site: SiteData; request: string };
  if (!userRequest?.trim()) return NextResponse.json({ error: "Escreva o que você quer mudar." }, { status: 400 });

  const niche = nicheById(site.nicheId);
  const lang = site.lang as Lang;

  // Fotos e logo ficam de fora: são pesadas e a IA não precisa delas
  const editable = {
    template: site.template,
    name: site.name,
    heroNote: site.heroNote ?? "",
    heroPhoto: site.heroImage ? "(own uploaded photo)" : site.heroPhoto ?? photosFor(site.nicheId)[0]?.id ?? "",
    aboutPhoto: site.aboutImage ? "(own uploaded photo)" : site.aboutPhoto ?? photosFor(site.nicheId)[1]?.id ?? "",
    headline: site.headline,
    sub: site.sub,
    about: site.about,
    services: site.services,
    benefits: site.benefits,
    phone: site.phone,
    email: site.email,
    address: site.address,
    city: site.city,
    hours: site.hours,
    primary: site.primary,
    dark: site.dark,
    light: site.light,
    showMap: site.showMap,
    showRating: site.showRating,
    hidden: site.hidden ?? {},
    blocks: site.blocks ?? [],
  };

  const prompt = `You edit a one-page website for a small local business. The user (a Brazilian web designer) writes requests in Portuguese.
Apply the request by returning a JSON EDIT, not HTML.

BUSINESS: ${site.name} — ${niche.search.en} in ${site.city}${site.rating ? ` — Google rating ${site.rating} (${site.reviews} reviews)` : ""}
WEBSITE LANGUAGE: ${LANG_EN[lang]}. Every text that appears on the website MUST be in ${LANG_EN[lang]}, natural and native for that country.

CURRENT SITE (JSON):
${JSON.stringify(editable)}

USER REQUEST (Portuguese):
"""${userRequest.slice(0, 1500)}"""

Return ONLY a JSON object with these optional keys:
{
  "summary": "1-2 short sentences IN PORTUGUESE (Brazil) telling the user what you changed",
  "set": { any of: "template" (one id from TEMPLATES below), "name", "heroNote", "headline", "sub", "about", "heroPhoto", "aboutPhoto",
           "services": [{"title","desc"}] (1-8), "benefits": [{"title","desc"}] (exactly 3),
           "phone", "email", "address", "city", "hours": ["Monday: 9:00–18:00", ...],
           "primary","dark","light" (hex like #1d6fe0; "light" must be a very light tint, "dark" a very dark shade),
           "showMap": bool, "showRating": bool },
  "hidden": { "services"|"why"|"about"|"contact": true to hide, false to show },
  "blocks": [ FULL list of extra sections after your edit (keep existing ones you are not removing, with the same "id") ]
}

THE TOP OF THE PAGE (hero) is fully editable through "set": it shows, in order, "heroNote" (optional short announcement shown right above the headline, max ~90 characters, e.g. a promotion or news; "" removes it), "headline" (the main title), "sub" (one supporting sentence), the call and WhatsApp buttons and the Google rating, plus the hero photo. When the user asks to put something "before/above the title", "at the top" or "in the hero", use "heroNote", "headline" or "sub" — never say it is impossible.
HERO/ABOUT PHOTOS: "heroPhoto" and "aboutPhoto" take one id from this list, or "none" for no photo (if the user uploaded their own photo it overrides these):
${photosFor(site.nicheId).map((p) => `- ${p.id}: ${p.alt}`).join("\n")}

TEMPLATES (id: look):
${TEMPLATES.filter((t) => !t.niche || t.niche === site.nicheId).map((t) => `- ${t.id}: ${t.description}`).join("\n")}
(The descriptions are in Portuguese. Templates starting with "n-" were designed for this trade.)

Extra section ("block") format:
{ "id": "keep existing id or create a short new one", "type": one of ${JSON.stringify(BLOCK_TYPES)},
  "position": one of ${JSON.stringify(BLOCK_POSITIONS)},
  "title": "...", "text": "intro or paragraph text", "button": "button label (cta only)",
  "items": [{"title":"...","desc":"...","price":"..."}], "html": "only for type custom" }
- text: title + text (paragraphs separated by blank lines)
- list: title + items (feature cards) · steps: title + numbered items · faq: items with title=question, desc=answer
- pricing: items with title, price (e.g. "€35"), desc · cta: highlighted band with title, text, button (calls the business)
- custom: simple HTML (div, p, h3, ul, li, strong, em, img with https src, a). No scripts, no forms, no style tags. Use only when no other type fits.

RULES:
- Only include keys you actually change. Omit "blocks" if you don't touch extra sections; if you include it, it is the complete list.
- NEVER invent facts: no fake reviews/testimonials, awards, years in business, certifications, guarantees, real prices or contact data. If the user asks for prices without giving them, use clearly editable placeholders like "€—" and say so in the summary.
- Keep copy short and conversion-focused. Headline max 9 words.
- If the request is unclear or impossible, change nothing and explain in "summary".`;

  let res!: Response;
  let data: { error?: { message?: string; status?: string }; candidates?: { content?: { parts?: { text?: string }[] } }[] } = {};
  for (const model of MODELS) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    });
    data = await res.json();
    if (res.ok || !isModelGone(res.status, data?.error?.message)) break;
  }

  if (!res.ok) {
    const msg = data?.error?.message ?? "Erro desconhecido";
    const status = data?.error?.status;
    const friendly =
      status === "RESOURCE_EXHAUSTED"
        ? "Limite grátis do Gemini atingido por agora. Espere um minuto e tente de novo."
        : status === "INVALID_ARGUMENT" && /API key/i.test(msg)
          ? "Chave do Gemini inválida. Confira em Configurações."
          : `Gemini: ${msg}`;
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  try {
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const raw = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    const patch = cleanPatch(raw, site);
    const summary = str(raw.summary, 400) ?? (Object.keys(patch).length ? "Alterações aplicadas." : "Nada foi alterado.");
    return NextResponse.json({ patch, summary });
  } catch {
    return NextResponse.json({ error: "A IA devolveu um formato inesperado. Tente reformular o pedido." }, { status: 502 });
  }
}
