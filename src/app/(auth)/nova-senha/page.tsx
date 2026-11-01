"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "@/components/Notice";

export default function NewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError("O link expirou ou é inválido. Peça um novo em “Esqueci a senha”.");
    router.push("/painel");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-[28px] font-black tracking-tight">Nova senha</h1>
        <p className="mt-1 text-[15px] text-muted">Escolha uma senha nova para sua conta.</p>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <div>
        <label className="label" htmlFor="p1">Nova senha</label>
        <input id="p1" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="p2">Repita a senha</label>
        <input id="p2" type="password" required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Salvando…" : "Salvar e entrar"}</button>
    </form>
  );
}
