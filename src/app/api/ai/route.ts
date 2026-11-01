import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LANG_NAMES, type Lang } from "@/lib/data/locales";
import { nicheById } from "@/lib/data/niches";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const LANG_EN: Record<Lang, string> = {
  en: "English (UK/Ireland)",
  de: "German",
  fr: "French",
  es: "Spanish (Spain)",
  it: "Italian",
  pt: "European Portuguese (Portugal)",
  nl: "Dutch",
};

const item = {
  type: "OBJECT",
  properties: { title: { type: "STRING" }, desc: { type: "STRING" } },
  required: ["title", "desc"],
};

const schema = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING" },
    sub: { type: "STRING" },
    about: { type: "STRING" },
    services: { type: "ARRAY", items: item },
    benefits: { type: "ARRAY", items: item },
  },
  required: ["headline", "sub", "about", "services", "benefits"],
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("gemini_api_key").eq("id", user.id).single();
  const key = profile?.gemini_api_key || process.env.GEMINI_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "Configure sua chave grátis do Gemini em Configurações para usar a IA." },
      { status: 400 }
    );

  const { site, instructions } = await req.json();
  const niche = nicheById(site.nicheId);
  const lang = site.lang as Lang;

  const prompt = `You are a conversion copywriter for small local business websites.
Rewrite the website texts below for this specific business. Keep the same structure.

Business: ${site.name}
Type: ${niche.search.en}
City: ${site.city}
Address: ${site.address}
${site.rating ? `Google rating: ${site.rating} (${site.reviews} reviews)` : ""}
${site.hours?.length ? `Opening hours: ${site.hours.join("; ")}` : ""}

Rules:
- Write ONLY in ${LANG_EN[lang]}, natural and native-sounding for that country.
- headline: max 8 words, mention the city when natural.
- sub: one sentence, max 22 words.
- about: 2-3 sentences, warm and concrete, max 60 words. Use the business name.
- services: exactly ${site.services.length} items, title max 4 words, desc max 12 words.
- benefits: exactly 3 items, title max 3 words, desc max 12 words.
- Do NOT invent facts such as years in business, awards, certifications, prices or guarantees.
- No emojis, no exclamation marks in headline.
${instructions ? `Extra instructions from the user (in Portuguese, apply them): ${instructions}` : ""}

Current texts (JSON):
${JSON.stringify({ headline: site.headline, sub: site.sub, about: site.about, services: site.services, benefits: site.benefits })}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message ?? "Erro desconhecido";
    const status = data?.error?.status;
    const friendly =
      status === "RESOURCE_EXHAUSTED"
        ? "Limite grátis do Gemini atingido por agora. Tente de novo em alguns minutos."
        : status === "INVALID_ARGUMENT" && /API key/i.test(msg)
          ? "Chave do Gemini inválida. Confira em Configurações."
          : `Gemini: ${msg}`;
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const out = JSON.parse(text);
    // Validação: só aceita o que tem o formato certo; o resto mantém o original
    const clean = (s: unknown, max: number) => (typeof s === "string" && s.trim() ? s.trim().slice(0, max) : null);
    const list = (arr: unknown, fallback: { title: string; desc: string }[]) =>
      Array.isArray(arr) && arr.length
        ? fallback.map((f, i) => ({
            title: clean(arr[i]?.title, 60) ?? f.title,
            desc: clean(arr[i]?.desc, 160) ?? f.desc,
          }))
        : fallback;
    return NextResponse.json({
      headline: clean(out.headline, 90) ?? site.headline,
      sub: clean(out.sub, 200) ?? site.sub,
      about: clean(out.about, 500) ?? site.about,
      services: list(out.services, site.services),
      benefits: list(out.benefits, site.benefits),
      model: MODEL,
      language: LANG_NAMES[lang],
    });
  } catch {
    return NextResponse.json({ error: "A IA devolveu um formato inesperado. Tente de novo." }, { status: 502 });
  }
}
