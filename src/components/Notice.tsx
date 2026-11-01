export function Notice({ kind, children }: { kind: "error" | "ok" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "error"
      ? "border-danger/30 bg-danger/5 text-danger"
      : kind === "ok"
        ? "border-ok/30 bg-ok-soft text-ok"
        : "border-line bg-bg text-muted";
  return <div className={`rounded-xl border px-3.5 py-2.5 text-[14px] ${cls}`}>{children}</div>;
}
