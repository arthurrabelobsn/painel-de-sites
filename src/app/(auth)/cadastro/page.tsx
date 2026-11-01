"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "@/components/Notice";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    setLoading(true);
    setError("");
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/painel`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push("/painel");
      router.refresh();
    } else setDone(true);
  }

  if (done)
    return (
      <div className="space-y-4">
        <h1 className="text-[28px] font-black tracking-tight">Confirme seu e-mail</h1>
        <Notice kind="ok">Enviamos um link para <b>{email}</b>. Clique nele para ativar a conta.</Notice>
        <Link href="/login" className="btn-ghost w-full">Voltar ao login</Link>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-[28px] font-black tracking-tight">Criar conta</h1>
        <p className="mt-1 text-[15px] text-muted">Leva menos de um minuto.</p>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <div>
        <label className="label" htmlFor="name">Seu nome</label>
        <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">Senha (mín. 8 caracteres)</label>
        <input id="password" type="password" required autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Criando…" : "Criar conta"}</button>
      <p className="text-center text-[14px] text-muted">
        Já tem conta? <Link href="/login" className="font-medium text-ink hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
