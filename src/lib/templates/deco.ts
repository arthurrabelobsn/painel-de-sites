/**
 * Elementos visuais de personalidade dos modelos de nicho: degradês, divisórias com forma,
 * texturas, faixas e pequenos elementos flutuantes. Tudo em SVG/CSS, nas cores do negócio.
 */
import { mix } from "./theme";

export type DividerKind = "wave" | "waves" | "zigzag" | "scallop" | "hills" | "drips" | "steps" | "slant" | "pulse" | "tiles";
export type PatternKind = "drops" | "circuit" | "keyholes" | "scales" | "grain" | "leaves" | "plus" | "paws" | "hex" | "gingham" | "beans" | "sparkles" | "dots" | "snow" | "wheat" | "petals";
export type FloaterKind = "bubbles" | "sparks" | "leaves" | "petals" | "snow" | "steam" | "paws";
export type StripKind = "pole" | "tape" | "checker" | "gingham" | "swatch";
export type HeroBg = "tint" | "glow" | "spot" | "mesh" | "deep" | "warm";

export type Deco = {
  heroBg?: HeroBg;
  divider?: DividerKind;
  pattern?: PatternKind; // textura no topo
  bandPattern?: PatternKind; // textura nas faixas de destaque (horário, ligar agora, porquê)
  floaters?: FloaterKind;
  strip?: StripKind;
  frame?: "offset" | "glow" | "ring";
  h1Grad?: boolean;
  underline?: boolean; // pincelada sob o título
};

const svgUrl = (svg: string) => `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;

/* ---------------- Degradês do topo ---------------- */
export function heroBackground(kind: HeroBg, bg: string, accent: string, light: string, dark: string) {
  switch (kind) {
    case "tint":
      return `linear-gradient(165deg,${bg} 0%,${bg} 35%,${mix(bg, accent, 0.16)} 100%)`;
    case "glow":
      return `radial-gradient(60% 70% at 78% 45%,${mix(bg, accent, 0.45)} 0%,${mix(bg, accent, 0.12)} 45%,${bg} 75%)`;
    case "spot":
      return `radial-gradient(55% 75% at 75% 40%,${mix(bg, "#ffffff", 0.1)} 0%,${bg} 70%),linear-gradient(180deg,${bg},${mix(bg, "#000000", 0.35)})`;
    case "mesh":
      return `radial-gradient(40% 55% at 85% 20%,${mix(bg, accent, 0.32)} 0%,transparent 70%),radial-gradient(45% 60% at 10% 90%,${mix(bg, light, 0.7)} 0%,transparent 70%),radial-gradient(35% 45% at 55% 60%,${mix(bg, accent, 0.14)} 0%,transparent 70%),${bg}`;
    case "deep":
      return `linear-gradient(150deg,${mix(bg, dark, 0.35)} 0%,${bg} 55%,${mix(bg, "#ffffff", 0.14)} 100%)`;
    case "warm":
      return `radial-gradient(80% 60% at 70% 105%,${mix(bg, accent, 0.5)} 0%,${mix(bg, accent, 0.16)} 45%,${bg} 80%)`;
  }
}

/** Cor do fim do degradê (para a divisória continuar a mesma cor) */
export function heroEnd(kind: HeroBg | undefined, bg: string, accent: string, dark: string) {
  if (kind === "tint") return mix(bg, accent, 0.16);
  if (kind === "spot") return mix(bg, "#000000", 0.35);
  if (kind === "deep") return mix(bg, "#ffffff", 0.14);
  if (kind === "warm") return mix(bg, accent, 0.2);
  void dark;
  return bg;
}

/* ---------------- Divisórias (penduradas no fim do topo, na cor do topo) ---------------- */
export function divider(kind: DividerKind, fill: string, accent: string) {
  const W = 1440;
  let body = "";
  switch (kind) {
    case "wave":
      body = `<path d="M0 0H${W}V38C1200 92 960 6 720 46S240 96 0 54Z" fill="${fill}"/>`;
      break;
    case "waves":
      body = `<path d="M0 0H${W}V62C1180 104 940 30 700 66S220 110 0 70Z" fill="${accent}" opacity=".35"/><path d="M0 0H${W}V34C1220 80 980 4 740 40S260 86 0 46Z" fill="${fill}"/>`;
      break;
    case "zigzag": {
      let d = `M0 0H${W}V40`;
      for (let x = W; x >= 0; x -= 48) d += `L${x - 24} ${x % 96 === 0 ? 74 : 40}`;
      body = `<path d="${d}L0 40Z" fill="${fill}"/>`;
      break;
    }
    case "scallop": {
      let d = `M0 0H${W}V30`;
      for (let x = W; x > 0; x -= 60) d += `A30 30 0 0 1 ${x - 60} 30`;
      body = `<path d="${d}Z" fill="${fill}"/>`;
      break;
    }
    case "tiles": {
      let d = `M0 0H${W}V22`;
      for (let x = W; x > 0; x -= 40) d += `Q${x - 20} 58 ${x - 40} 22`;
      body = `<path d="${d}Z" fill="${fill}"/><path d="${d.replace(/V22/, "V8").replace(/ 22/g, " 8").replace(/ 58 /g, " 44 ")}Z" fill="${accent}" opacity=".25"/>`;
      break;
    }
    case "hills":
      body = `<path d="M0 0H${W}V70C1240 30 1080 96 860 58S420 20 260 64 60 70 0 50Z" fill="${accent}" opacity=".45"/><path d="M0 0H${W}V40C1180 76 980 14 760 44S320 84 0 30Z" fill="${fill}"/>`;
      break;
    case "drips": {
      const drips = [60, 170, 230, 390, 520, 610, 760, 905, 980, 1120, 1250, 1370];
      const lens = [54, 88, 36, 70, 46, 96, 58, 40, 82, 50, 74, 44];
      body = `<rect width="${W}" height="18" fill="${accent}"/>${drips
        .map((x, i) => `<path d="M${x - 9} 10V${lens[i]}a9 9 0 0 0 18 0V10Z" fill="${accent}"/>`)
        .join("")}`;
      return `<svg viewBox="0 0 ${W} 110" preserveAspectRatio="none" aria-hidden="true">${body}</svg>`;
    }
    case "steps": {
      let d = `M0 0H${W}V30`;
      const h = [30, 58, 30, 44, 30, 70, 30, 50, 30];
      for (let i = 0, x = W; x > 0; i++, x -= 80) d += `H${x - 40}V${h[i % h.length]}H${x - 80}V30`;
      body = `<path d="${d}Z" fill="${fill}"/>`;
      break;
    }
    case "slant":
      body = `<path d="M0 0H${W}V12L0 96Z" fill="${fill}"/>`;
      break;
    case "pulse":
      body = `<rect width="${W}" height="40" fill="${fill}"/><path d="M0 70H560L590 70L612 26L640 104L668 46L690 70H${W}" fill="none" stroke="${accent}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
  }
  return `<svg viewBox="0 0 ${W} 110" preserveAspectRatio="none" aria-hidden="true">${body}</svg>`;
}

/* ---------------- Texturas (azulejo SVG repetido) ---------------- */
export function pattern(kind: PatternKind, color: string, alpha = 0.1) {
  const c = color;
  const o = `fill-opacity="${alpha}"`;
  const s = `stroke="${c}" stroke-opacity="${alpha * 1.6}" fill="none"`;
  const tiles: Record<PatternKind, [number, string]> = {
    dots: [28, `<circle cx="14" cy="14" r="2.2" fill="${c}" ${o}/>`],
    drops: [56, `<path d="M18 10c5 8 8 12 8 16a8 8 0 0 1-16 0c0-4 3-8 8-16Z" fill="${c}" ${o}/><path d="M44 36c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10Z" fill="${c}" ${o}/>`],
    circuit: [80, `<g ${s} stroke-width="1.5"><path d="M0 20H30L40 30V60H80M20 80V60H10M60 0V20L70 30H80"/><circle cx="40" cy="60" r="3"/><circle cx="20" cy="60" r="3"/><circle cx="60" cy="20" r="3"/></g>`],
    keyholes: [60, `<g fill="${c}" ${o}><circle cx="30" cy="24" r="7"/><path d="M26 28h8l3 14H23Z"/></g>`],
    scales: [48, `<g ${s} stroke-width="2"><path d="M0 24a24 24 0 0 1 48 0M-24 48a24 24 0 0 1 48 0M24 48a24 24 0 0 1 48 0"/></g>`],
    grain: [120, `<g ${s} stroke-width="1.4"><path d="M0 20C30 14 60 28 120 18M0 52C40 44 80 62 120 50M0 86C24 80 70 96 120 84M0 110C50 104 80 116 120 108"/></g>`],
    leaves: [72, `<g fill="${c}" ${o}><path d="M18 40C18 24 30 14 46 12 46 30 34 40 18 40Z"/><path d="M50 66C50 56 58 50 68 49 68 60 60 66 50 66Z"/></g>`],
    plus: [40, `<path d="M18 12h4v6h6v4h-6v6h-4v-6h-6v-4h6Z" fill="${c}" ${o}/>`],
    paws: [80, `<g fill="${c}" ${o}><ellipse cx="24" cy="30" rx="8" ry="7"/><circle cx="15" cy="19" r="3.4"/><circle cx="21" cy="14" r="3.4"/><circle cx="28" cy="14" r="3.4"/><circle cx="34" cy="19" r="3.4"/><g transform="translate(40 40) rotate(20)"><ellipse cx="12" cy="18" rx="7" ry="6"/><circle cx="4" cy="9" r="3"/><circle cx="10" cy="5" r="3"/><circle cx="16" cy="5" r="3"/><circle cx="21" cy="9" r="3"/></g></g>`],
    hex: [56, `<path d="M14 2h28l14 24-14 24H14L0 26Z" ${s} stroke-width="1.6"/>`],
    gingham: [40, `<rect width="20" height="40" fill="${c}" fill-opacity="${alpha}"/><rect width="40" height="20" fill="${c}" fill-opacity="${alpha}"/>`],
    beans: [64, `<g fill="${c}" ${o}><ellipse cx="18" cy="18" rx="7" ry="10" transform="rotate(30 18 18)"/><ellipse cx="46" cy="46" rx="7" ry="10" transform="rotate(-20 46 46)"/></g>`],
    sparkles: [90, `<g fill="${c}" ${o}><path d="M22 8l3 11 11 3-11 3-3 11-3-11-11-3 11-3Z"/><path d="M66 56l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></g>`],
    snow: [70, `<g ${s} stroke-width="1.6" stroke-linecap="round"><path d="M20 10v20M10 20h20M13 13l14 14M27 13 13 27"/><path d="M54 46v12M48 52h12"/></g>`],
    wheat: [70, `<g fill="${c}" ${o}><ellipse cx="20" cy="14" rx="4" ry="8" transform="rotate(-25 20 14)"/><ellipse cx="28" cy="22" rx="4" ry="8" transform="rotate(25 28 22)"/><ellipse cx="18" cy="28" rx="4" ry="8" transform="rotate(-25 18 28)"/><ellipse cx="54" cy="52" rx="3" ry="6" transform="rotate(30 54 52)"/></g>`],
    petals: [90, `<g fill="${c}" ${o}><path d="M24 10c8 6 8 18 0 24-8-6-8-18 0-24Z"/><path d="M66 50c6 4 6 14 0 18-6-4-6-14 0-18Z" transform="rotate(40 66 59)"/></g>`],
  };
  const [size, body] = tiles[kind];
  return `${svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`)}`;
}

/* ---------------- Faixas finas (abaixo do cabeçalho) ---------------- */
export function strip(kind: StripKind, accent: string, dark: string, light: string) {
  switch (kind) {
    case "pole":
      return `repeating-linear-gradient(-45deg,${accent} 0 14px,#ffffff 14px 28px,${dark} 28px 42px,#ffffff 42px 56px)`;
    case "tape":
      return `repeating-linear-gradient(-45deg,${accent} 0 18px,${dark} 18px 36px)`;
    case "checker":
      return `conic-gradient(${dark} 25%,${light} 0 50%,${dark} 0 75%,${light} 0) 0 0/16px 16px`;
    case "gingham":
      return `${pattern("gingham", accent, 0.55)},${light}`;
    case "swatch":
      return `linear-gradient(90deg,${mix(accent, "#ffffff", 0.6)},${accent} 30%,${mix(accent, dark, 0.5)} 55%,${mix(accent, "#ffd166", 0.55)} 80%,${mix(accent, "#ffffff", 0.3)})`;
  }
}

/* ---------------- Elementos flutuantes no topo ---------------- */
const SPOTS = [
  [6, 18, 1],
  [16, 72, 0.6],
  [32, 12, 0.45],
  [47, 84, 0.8],
  [58, 26, 0.5],
  [71, 64, 0.7],
  [86, 14, 0.9],
  [93, 58, 0.55],
];

export function floaters(kind: FloaterKind, color: string) {
  const shape = (s: number) => {
    switch (kind) {
      case "bubbles":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><circle cx="20" cy="20" r="17" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-opacity=".5" stroke-width="2"/><circle cx="14" cy="13" r="4" fill="#fff" fill-opacity=".7"/></svg>`;
      case "sparks":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M20 2l4 14 14 4-14 4-4 14-4-14L2 20l14-4Z" fill="${color}"/></svg>`;
      case "leaves":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M6 34C6 16 18 6 36 4 36 24 24 34 6 34Z" fill="${color}" fill-opacity=".8"/><path d="M8 32 30 10" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/></svg>`;
      case "petals":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M20 3c12 9 12 25 0 34C8 28 8 12 20 3Z" fill="${color}" fill-opacity=".75"/></svg>`;
      case "snow":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><g stroke="${color}" stroke-width="2.6" stroke-linecap="round"><path d="M20 4v32M4 20h32M9 9l22 22M31 9 9 31"/></g></svg>`;
      case "steam":
        return `<svg viewBox="0 0 40 60" width="${s * 0.7}" height="${s}"><path d="M14 56c-8-10 8-16 0-28s8-16 4-26M28 56c-6-8 6-14 0-24s6-14 3-22" fill="none" stroke="${color}" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>`;
      case "paws":
        return `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><g fill="${color}" fill-opacity=".7"><ellipse cx="20" cy="26" rx="9" ry="8"/><circle cx="9" cy="15" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="24" cy="9" r="4"/><circle cx="31" cy="15" r="4"/></g></svg>`;
    }
  };
  return `<div class="fl" aria-hidden="true">${SPOTS.map(
    ([x, y, k], i) => `<span style="left:${x}%;top:${y}%;--d:${(i % 4) * 1.3}s;--t:${7 + (i % 3) * 2}s">${shape(Math.round(18 + k * 30))}</span>`,
  ).join("")}</div>`;
}

/** Pincelada sob o título (pintor) */
export const brushStroke = (color: string) =>
  `<svg class="brush" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M6 26C90 10 210 30 300 18S520 8 594 22C540 34 420 30 300 34S70 40 6 26Z" fill="${color}"/></svg>`;
