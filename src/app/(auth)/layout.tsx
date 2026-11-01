export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-black">P</span>
          Painel de Sites
        </div>
        <div>
          <p className="max-w-md text-[44px] font-black leading-[1.02] tracking-tight">
            Ache o negócio.
            <br />
            Mostre o site pronto.
            <br />
            <span className="text-accent">Feche o cliente.</span>
          </p>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/60">
            Encontre comércios na Europa sem site, gere uma demonstração no idioma deles e
            envie a abordagem em minutos.
          </p>
        </div>
        <ol className="grid grid-cols-3 gap-3 text-[13px] text-white/70">
          {["Localizar", "Gerar demo", "Abordar"].map((s, i) => (
            <li key={s} className="rounded-xl border border-white/10 p-3">
              <span className="block font-mono text-accent">0{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
