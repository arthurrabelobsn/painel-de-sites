"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "@/components/Notice";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nova-senha`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-[28px] font-black tracking-tight">Esqueci a senha</h1>
        <p className="mt-1 text-[15px] text-muted">Enviamos um link para você criar uma nova.</p>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {sent ? (
        <Notice kind="ok">
          Se existir uma conta com <b>{email}</b>, o link chega em instantes. Confira também o spam.
        </Notice>
      ) : (
        <>
          <div>
            <label className="label" htmlFor="email">E-mail da conta</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar link"}</button>
        </>
      )}
      <Link href="/login" className="block text-center text-[14px] font-medium text-muted hover:text-ink">← Voltar ao login</Link>
    </form>
  );
}
