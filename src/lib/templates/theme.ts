/** Cores derivadas das três cores do negócio (primária, escura, clara). Tudo calculado aqui, sem color-mix, para o PDF sair igual. */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function rgb(hex: string): [number, number, number] {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1] ?? "777777";
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export const hex = ([r, g, b]: [number, number, number]) => `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;

/** Mistura a com b; t=0 devolve a, t=1 devolve b */
export function mix(a: string, b: string, t: number) {
  const A = rgb(a);
  const B = rgb(b);
  return hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

export function luminance(c: string) {
  const ch = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** Cor de texto legível sobre um fundo: a escura do negócio ou quase branco */
export function onColor(bg: string, dark: string) {
  const light = "#fcfcfc";
  const ink = contrast(dark, "#ffffff") > 7 ? dark : "#111111";
  return contrast(bg, light) >= contrast(bg, ink) ? light : ink;
}

export type FieldKind = "ground" | "tone" | "light" | "accent" | "dark";

export type Palette = {
  ground: string;
  ink: string;
  accent: string;
  onAccent: string;
  light: string;
  dark: string;
};

/** Variáveis de uma faixa de cor: fundo, texto, texto secundário, superfície, ação e texto da ação */
export function fieldVars(p: Palette, kind: FieldKind) {
  let bg = p.ground;
  let fg = p.ink;
  if (kind === "tone") bg = mix(p.ground, p.ink, 0.05);
  if (kind === "light") {
    bg = p.light;
    fg = onColor(p.light, p.dark);
  }
  if (kind === "accent") {
    bg = p.accent;
    fg = p.onAccent;
  }
  if (kind === "dark") {
    bg = p.dark;
    fg = onColor(p.dark, p.dark);
  }
  // A ação precisa aparecer sobre o fundo: na faixa da cor primária, o botão inverte
  let act = p.accent;
  if (kind === "accent" || contrast(act, bg) < 2.2) act = fg;
  const onAct = act === fg ? bg : p.onAccent;
  return {
    bg,
    fg,
    actText: contrast(p.accent, bg) >= 3 && kind !== "accent" ? p.accent : fg,
    mut: mix(fg, bg, 0.3),
    surf: mix(bg, fg, 0.06),
    act,
    onAct,
  };
}

export function fieldCss(p: Palette, kind: FieldKind) {
  const v = fieldVars(p, kind);
  return `--bg:${v.bg};--fg:${v.fg};--mut:${v.mut};--surf:${v.surf};--act:${v.act};--on-act:${v.onAct};--act-t:${v.actText};background:${v.bg};color:${v.fg}`;
}

/** Cor com transparência (para degradês que fundem a foto com o fundo) */
export function alpha(c: string, a: number) {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${a})`;
}
