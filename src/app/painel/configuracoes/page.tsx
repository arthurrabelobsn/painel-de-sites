"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Notice } from "@/components/Notice";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [p, setP] = useState<Partial<Profile>>({});
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      setP(data ?? { id: user!.id });
      setLoaded(true);
    })();
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: p.full_name ?? null,
      sender_name: p.sender_name ?? null,
      sender_email: p.sender_email ?? null,
      sender_phone: p.sender_phone ?? null,
      gemini_api_key: p.gemini_api_key?.trim() || null,
    });
    setMsg(error ? { kind: "error", text: error.message } : { kind: "ok", text: "Configurações salvas." });
  }

  async function changePassword() {
    if (newPass.length < 8) return setMsg({ kind: "error", text: "A senha precisa ter pelo menos 8 caracteres." });
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setNewPass("");
    setMsg(error ? { kind: "error", text: error.message } : { kind: "ok", text: "Senha alterada." });
  }

  const f = (k: keyof Profile) => ({
    value: (p[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setP((x) => ({ ...x, [k]: e.target.value })),
  });

  if (!loaded) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" />
      {msg && <div className="mb-5"><Notice kind={msg.kind}>{msg.text}</Notice></div>}

      <form onSubmit={save} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="text-[18px] font-bold">Assinatura das mensagens</h2>
          <div>
            <label className="label">Seu nome (entra no lugar de {"{sender}"})</label>
            <input className="input" placeholder="Ex.: Arthur — Web Studio" {...f("sender_name")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Seu e-mail profissional</label>
              <input className="input" type="email" {...f("sender_email")} />
            </div>
            <div>
              <label className="label">Seu WhatsApp</label>
              <input className="input" {...f("sender_phone")} />
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold">IA grátis (Google Gemini)</h2>
            {p.gemini_api_key ? <span className="chip bg-ok-soft text-ok">Conectada</span> : <span className="chip bg-bg text-muted">Não conectada</span>}
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-[14px] text-muted">
            <li>Acesse <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="font-medium text-ink underline">aistudio.google.com/apikey</a> com sua conta Google.</li>
            <li>Clique em <b>Create API key</b> e copie a chave.</li>
            <li>Cole abaixo e salve. A camada gratuita é suficiente para personalizar dezenas de sites por dia.</li>
          </ol>
          <div>
            <label className="label">Chave da API do Gemini</label>
            <input className="input font-mono text-[13px]" type="password" placeholder="AIza…" autoComplete="off" {...f("gemini_api_key")} />
          </div>
          <p className="text-[12px] text-muted">A chave fica salva só na sua conta. No plano grátis, o Google pode usar os textos enviados para melhorar os modelos — aqui só vão dados públicos do negócio.</p>
        </section>

        <button className="btn-primary">Salvar configurações</button>
      </form>

      <section className="card mt-6 space-y-3 p-6">
        <h2 className="text-[18px] font-bold">Trocar senha</h2>
        <div className="flex gap-2">
          <input className="input" type="password" placeholder="Nova senha" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <button type="button" className="btn-ghost shrink-0" onClick={changePassword}>Alterar</button>
        </div>
      </section>
    </div>
  );
}
