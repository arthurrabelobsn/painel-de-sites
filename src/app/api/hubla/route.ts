/**
 * Webhook da Hubla: cada compra aprovada cria o acesso do comprador no painel
 * (usuário no Supabase Auth com a senha padrão, e-mail já confirmado).
 *
 * Variáveis de ambiente (só no servidor, nunca com NEXT_PUBLIC_):
 *   HUBLA_TOKEN                 token do webhook (Hubla → Integrações → Webhook); chega no cabeçalho x-hubla-token
 *   SUPABASE_SERVICE_ROLE_KEY   chave "service_role" do Supabase (Project Settings → API)
 *   DEFAULT_USER_PASSWORD       senha padrão dos novos acessos
 *   HUBLA_PRODUCT_IDS           opcional: ids de produto aceitos, separados por vírgula
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

type Json = Record<string, unknown>;

// Eventos que liberam acesso e eventos que nunca devem liberar
const GRANT = /member_added|access_granted|payment_succeeded|payment_approved|invoice\.paid|subscription\.activated|newsale|newuser|approved|paid|completed/i;
const DENY = /refund|cancel|deactivat|expired|removed|failed|refused|chargeback|pending|created_pix|waiting/i;

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Procura o comprador no evento: primeiro nos lugares de costume, depois em qualquer objeto com e-mail */
function findBuyer(body: Json): { email: string; name: string } | null {
  const ev = isObj(body.event) ? body.event : isObj(body.data) ? body.data : body;
  const preferred = ["user", "payer", "customer", "buyer", "member", "lead"];
  const pick = (o: Json) => {
    const email = typeof o.email === "string" && EMAIL.test(o.email.trim()) ? o.email.trim().toLowerCase() : "";
    if (!email) return null;
    const first = typeof o.firstName === "string" ? o.firstName : typeof o.first_name === "string" ? o.first_name : "";
    const last = typeof o.lastName === "string" ? o.lastName : typeof o.last_name === "string" ? o.last_name : "";
    const name = typeof o.name === "string" ? o.name : typeof o.fullName === "string" ? o.fullName : `${first} ${last}`.trim();
    return { email, name };
  };
  for (const k of preferred) if (isObj(ev[k])) { const r = pick(ev[k] as Json); if (r) return r; }
  // busca em profundidade (ex.: event.invoice.payer.email, event.subscription.payer.email)
  const stack: Json[] = [ev];
  while (stack.length) {
    const o = stack.shift()!;
    for (const k of preferred) if (isObj(o[k])) { const r = pick(o[k] as Json); if (r) return r; }
    for (const v of Object.values(o)) if (isObj(v)) stack.push(v);
  }
  return pick(ev);
}

function productIds(body: Json): string[] {
  const out = new Set<string>();
  const stack: unknown[] = [body];
  while (stack.length) {
    const o = stack.pop();
    if (Array.isArray(o)) stack.push(...o);
    else if (isObj(o)) {
      for (const [k, v] of Object.entries(o)) {
        if ((k === "product" || k === "products") && v) stack.push(v);
        if (/^product_?id$/i.test(k) && (typeof v === "string" || typeof v === "number")) out.add(String(v));
        if (k === "id" && (typeof v === "string" || typeof v === "number") && isObj(o) && ("name" in o || "price" in o)) out.add(String(v));
        if (isObj(v) || Array.isArray(v)) stack.push(v);
      }
    }
  }
  return [...out];
}

export async function POST(req: Request) {
  const expected = process.env.HUBLA_TOKEN;
  const got = req.headers.get("x-hubla-token") ?? "";
  if (!expected || !safeEqual(got, expected)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.DEFAULT_USER_PASSWORD;
  if (!url || !serviceKey || !password) {
    console.error("[hubla] faltam SUPABASE_SERVICE_ROLE_KEY ou DEFAULT_USER_PASSWORD");
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = String(body.type ?? body.event_type ?? (isObj(body.event) ? (body.event as Json).type ?? "" : ""));
  const eventId = req.headers.get("x-hubla-idempotency") ?? "";

  // Só eventos de compra/acesso aprovados criam usuário; os demais são aceitos (200) e ignorados
  if (!type || DENY.test(type) || !GRANT.test(type)) {
    console.log(`[hubla] ignorado: ${type || "(sem tipo)"} ${eventId}`);
    return NextResponse.json({ ok: true, ignored: type || "unknown" });
  }

  const allowed = (process.env.HUBLA_PRODUCT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.length && !productIds(body).some((id) => allowed.includes(id))) {
    console.log(`[hubla] outro produto: ${type} ${eventId}`);
    return NextResponse.json({ ok: true, ignored: "product" });
  }

  const buyer = findBuyer(body);
  if (!buyer) {
    console.error(`[hubla] evento sem e-mail do comprador: ${type} ${eventId}`, JSON.stringify(body).slice(0, 2000));
    return NextResponse.json({ ok: true, ignored: "no email" });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.createUser({
    email: buyer.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: buyer.name, source: "hubla" },
  });

  if (error) {
    // comprador que já tinha acesso (compra repetida ou evento duplicado): nada a fazer
    if (/already|registered|exists/i.test(error.message)) {
      console.log(`[hubla] já cadastrado: ${buyer.email}`);
      return NextResponse.json({ ok: true, existing: true });
    }
    console.error(`[hubla] erro ao criar ${buyer.email}: ${error.message}`);
    // 500 faz a Hubla tentar de novo mais tarde
    return NextResponse.json({ error: "create failed" }, { status: 500 });
  }

  console.log(`[hubla] acesso criado: ${buyer.email} (${type})`);
  return NextResponse.json({ ok: true, created: true });
}

/** Para testar se a rota está no ar */
export function GET() {
  return NextResponse.json({ ok: true, endpoint: "hubla webhook" });
}
