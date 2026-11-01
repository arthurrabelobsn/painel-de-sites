// Aparece na hora em que se clica num link do menu, enquanto a página carrega
export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="mb-3 h-8 w-64 rounded-lg bg-line" />
      <div className="mb-8 h-4 w-96 max-w-full rounded bg-line/70" />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-line/60" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-line/50" />
    </div>
  );
}
