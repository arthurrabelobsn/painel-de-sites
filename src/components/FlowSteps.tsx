import Link from "next/link";

/**
 * As três etapas de cada cliente: 1. Cliente escolhido → 2. Site de demonstração → 3. Mensagem com o link.
 * Etapas concluídas ganham ✓ e todas são clicáveis para voltar.
 */
export function FlowSteps({
  leadId,
  siteId,
  current,
  siteDone,
  sentDone,
  compact = false,
}: {
  leadId: string;
  siteId?: string | null;
  current: 1 | 2 | 3;
  siteDone: boolean;
  sentDone: boolean;
  compact?: boolean;
}) {
  const steps = [
    { n: 1, label: "Cliente", hint: "Escolhido na busca", href: `/painel/leads/${leadId}`, done: true },
    { n: 2, label: "Site de demonstração", hint: siteDone ? "Pronto" : "Escolha o modelo e ajuste", href: siteId ? `/painel/sites/${siteId}` : `/painel/sites/novo?lead=${leadId}`, done: siteDone },
    { n: 3, label: "Mensagem com o link", hint: sentDone ? "Enviada" : siteDone ? "Pronta para enviar" : "Depois do site", href: `/painel/leads/${leadId}#mensagem`, done: sentDone },
  ] as const;

  return (
    <ol className={`flex items-center ${compact ? "gap-1.5" : "gap-2 md:gap-3"}`} aria-label="Etapas">
      {steps.map((s, i) => {
        const active = s.n === current;
        const locked = s.n === 3 && !siteDone;
        const circle = s.done && !active
          ? "bg-ink text-white"
          : active
            ? "bg-accent text-white ring-4 ring-accent/15"
            : "border border-line bg-surface text-muted";
        const body = (
          <span className="flex items-center gap-2.5">
            <span className={`grid shrink-0 place-items-center rounded-full font-bold tabular-nums transition ${compact ? "h-6 w-6 text-[12px]" : "h-8 w-8 text-[14px]"} ${circle}`}>
              {s.done && !active ? "✓" : s.n}
            </span>
            <span className={compact ? "hidden xl:block" : "hidden sm:block"}>
              <span className={`block leading-tight ${compact ? "text-[13px]" : "text-[14px]"} font-semibold ${active ? "text-ink" : "text-muted"}`}>{s.label}</span>
              {!compact && <span className="block text-[12px] leading-tight text-muted">{s.hint}</span>}
            </span>
          </span>
        );
        return (
          <li key={s.n} className="flex min-w-0 items-center gap-2 md:gap-3" aria-current={active ? "step" : undefined}>
            {locked || active ? (
              <span className={locked ? "opacity-60" : ""}>{body}</span>
            ) : (
              <Link href={s.href} className="rounded-xl transition hover:opacity-80">{body}</Link>
            )}
            {i < steps.length - 1 && (
              <span className={`h-[2px] shrink-0 rounded-full ${compact ? "w-4 xl:w-6" : "w-6 md:w-12"} ${s.done ? "bg-ink" : "bg-line"}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
