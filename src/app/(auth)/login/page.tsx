"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "@/components/Notice";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : error.message.includes("Email not confirmed")
            ? "Confirme seu e-mail antes de entrar (veja sua caixa de entrada)."
            : error.message
      );
      return;
    }
    router.push("/painel");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-[28px] font-black tracking-tight">Entrar</h1>
        <p className="mt-1 text-[15px] text-muted">Acesse seu painel.</p>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">Senha</label>
          <Link href="/esqueci-a-senha" className="mb-1.5 text-[13px] font-medium text-accent hover:underline">
            Esqueci a senha
          </Link>
        </div>
        <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-[14px] text-muted">
        O acesso é liberado após a compra: entre com o e-mail usado no pagamento.
        {process.env.NEXT_PUBLIC_SALES_URL && (
          <>
            {" "}
            <a href={process.env.NEXT_PUBLIC_SALES_URL} className="font-medium text-ink hover:underline">Ainda não tem acesso?</a>
          </>
        )}
      </p>
    </form>
  );
}
