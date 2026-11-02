/**
 * Renderizador dos modelos. Um modelo (presets.ts) escolhe tipografia, forma, cores e a composição de cada seção;
 * aqui cada composição vira HTML estático, sem JavaScript (as demos rodam com scripts bloqueados).
 *
 * Regras seguidas (tasteskill + Emil Kowalski): título em até 2 linhas, um h1 por página, título em toda seção,
 * margens externas iguais, sem rótulos pequenos acima de títulos, sem numeração decorativa, sem linhas finas,
 * sem gradientes, sem sombras em repouso, sem cartões com ícone no topo, no máximo duas famílias tipográficas,
 * uma cor de ação; movimento só em transform/opacity, com versão para quem reduz movimento.
 */
import { SITE_UI } from "../data/locales";
import { icon } from "./icons";
import { applyBlocks } from "./blocks";
import { FONTS, MOTIFS, presetById, type FontSystem, type Preset } from "./presets";
import { brushStroke, divider, floaters, heroBackground, heroEnd, pattern, strip } from "./deco";
import { photosFor, photoUrl } from "../data/photos";
import { alpha, fieldCss, fieldVars, mix, onColor, contrast, type FieldKind, type Palette } from "./theme";
import type { RenderOptions, SiteData } from "./types";

export const esc = (s: string | number | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const digits = (s: string) => s.replace(/[^\d+]/g, "");
const telHref = (d: SiteData) => `tel:${digits(d.intlPhone || d.phone)}`;
const waHref = (d: SiteData) => `https://wa.me/${d.whatsapp.replace(/\D/g, "")}`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /[\p{L}\d]/u.test(w[0] ?? ""))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "•";

/** Favicon do site do cliente: a logo, se houver; senão, as iniciais na cor do negócio */
function favicon(d: SiteData) {
  if (d.logo) return d.logo;
  const ini = esc(initials(d.name).slice(0, 2));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${d.primary}"/><text x="32" y="42" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${ini.length > 1 ? 26 : 32}" fill="${onColor(d.primary, d.dark)}">${ini}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---------------- Tamanho de título que cabe em N linhas ---------------- */
function fit(text: string, widthVw: number, f: FontSystem, lines: number, minPx: number, maxPx: number) {
  const len = Math.max(6, [...text].length);
  // 0.86: margem de segurança para palavras longas que não quebram onde a conta prevê
  const vw = (0.86 * widthVw * lines) / ((f.cw + Math.abs(f.track)) * len * (f.upper ? 1.22 : 1));
  return `clamp(${minPx}px,${vw.toFixed(2)}vw,${maxPx}px)`;
}

/** Variáveis de tamanho para desktop e celular */
function fs(text: string, f: FontSystem, desk: number, lines: number, min: number, max: number, mobMin = min, mobMax = max, mobLines = lines) {
  return `--fs:${fit(text, desk, f, lines, min, max)};--fsm:${fit(text, 90, f, mobLines, mobMin, mobMax)}`;
}

/* ---------------- Paleta do modelo ---------------- */
function palette(d: SiteData, p: Preset): Palette {
  const inkFrom = (bg: string) => (contrast(d.dark, bg) >= 7 ? d.dark : mix(d.dark, "#000000", 0.6));
  if (p.mode === "dark") {
    const ground = contrast(d.dark, "#ffffff") >= 10 ? d.dark : mix(d.dark, "#000000", 0.55);
    const ink = mix(d.light, "#ffffff", 0.6);
    return { ground, ink, accent: d.primary, onAccent: onColor(d.primary, ground), light: d.light, dark: mix(ground, "#000000", 0.4) };
  }
  const ground = p.mode === "paper" ? mix(d.light, "#ffffff", 0.4) : mix("#ffffff", d.light, 0.22);
  return { ground, ink: inkFrom(ground), accent: d.primary, onAccent: onColor(d.primary, d.dark), light: d.light, dark: d.dark };
}

type Ctx = { d: SiteData; p: Preset; f: FontSystem; pal: Palette; ui: (typeof SITE_UI)["en"]; o: RenderOptions };

const field = (c: Ctx, sec: keyof NonNullable<Preset["fields"]>, fallback: FieldKind = "ground") =>
  c.p.fields?.[sec] ?? fallback;

/* ---------------- Peças pequenas ---------------- */
function wordmark(c: Ctx) {
  const { d } = c;
  if (d.logo) return `<img class="wm-img" src="${d.logo}" alt="${esc(d.name)}"/>`;
  return `<span class="wm-name">${esc(d.name)}</span>`;
}

function ctas(c: Ctx, alt = true) {
  const { d, ui } = c;
  const a: string[] = [];
  if (d.phone) a.push(`<a class="btn" href="${telHref(d)}">${icon("phone", 18)}<span>${esc(ui.callNow)}</span></a>`);
  if (alt && d.whatsapp) a.push(`<a class="btn btn-alt" href="${waHref(d)}" target="_blank" rel="noopener">${icon("chat", 18)}<span>WhatsApp</span></a>`);
  if (!a.length && d.email) a.push(`<a class="btn" href="mailto:${esc(d.email)}">${icon("mail", 18)}<span>${esc(d.email)}</span></a>`);
  return a.length ? `<div class="acts">${a.join("")}</div>` : "";
}

function rating(c: Ctx) {
  const { d, ui } = c;
  if (!d.showRating || !d.rating) return "";
  return `<p class="rating">${icon("star", 18, "#f5b301", 1.5, "#f5b301")}<b>${d.rating.toFixed(1)}</b><span>${d.reviews ?? ""} ${esc(ui.rating)}</span></p>`;
}

const STOCK = /^photo-[\w-]+$/;

/** Foto de banco escolhida: undefined = a padrão do nicho; "" = nenhuma */
function stock(c: Ctx, which: "hero" | "about") {
  const { d } = c;
  const list = photosFor(d.nicheId);
  const chosen = which === "hero" ? d.heroPhoto : d.aboutPhoto;
  const id = chosen === undefined ? list[which === "hero" ? 0 : 1]?.id ?? "" : chosen;
  if (!id || !STOCK.test(id)) return null;
  return { id, alt: list.find((x) => x.id === id)?.alt ?? d.name };
}

/** Moldura decorativa atrás da imagem (sombra deslocada, brilho ou contorno) */
function framed(c: Ctx, inner: string, cls: string) {
  const fr = c.p.deco?.frame;
  if (!fr || c.p.soft || cls.includes("split")) return inner;
  const col = fr === "glow" ? c.pal.accent : mix(c.pal.accent, c.pal.light, 0.35);
  return `<div class="mw ${fr}" style="--frc:${col}"><div class="fr mf"></div>${inner}</div>`;
}

/** Imagem na forma do modelo: foto enviada, foto de banco do nicho ou, sem nenhuma, o desenho do ofício */
function media(c: Ctx, cls: string, onField: FieldKind, pos = "50% 50%", which: "hero" | "about" = "hero") {
  const { d } = c;
  const upload = which === "hero" ? d.heroImage : d.aboutImage;
  if (upload)
    return framed(c, `<div class="media ${c.p.soft ? "soft" : "mf"} ${cls}"><img src="${upload}" alt="${esc(d.name)}" style="object-position:${pos}"/></div>`, cls);
  const plateKind: FieldKind = onField === "accent" ? "dark" : "accent";
  const v = fieldVars(c.pal, plateKind);
  const ph = stock(c, which);
  const photo = ph ? `<div class="ph" style="background-image:url('${photoUrl(ph.id, which === "hero" ? 1600 : 1100)}');background-position:${pos}"></div>` : "";
  return framed(
    c,
    `<div class="media ${c.p.soft ? "soft" : "mf"} plate ${cls}" style="background:${v.bg};color:${v.fg}" role="img" aria-label="${esc(ph?.alt ?? d.name)}">${icon(d.nicheId, 120, "currentColor", 0.9)}${photo}</div>`,
    cls,
  );
}

/** Seção "sobre": foto (enviada ou de banco) ou um selo com as iniciais do nome */
function seal(c: Ctx, onField: FieldKind) {
  const { d } = c;
  if (d.aboutImage || stock(c, "about")) return media(c, "about-media", onField, "50% 40%", "about");
  if (d.heroImage) return media(c, "about-media", onField, "50% 30%");
  const v = fieldVars(c.pal, onField === "dark" || c.p.mode === "dark" ? "accent" : "dark");
  return framed(c, `<div class="media mf seal" style="background:${v.bg};color:${v.fg}" role="img" aria-label="${esc(d.name)}"><span>${esc(initials(d.name))}</span></div>`, "");
}

function hoursTable(c: Ctx, cls = "hrs") {
  const { d } = c;
  if (!d.hours.length) return "";
  return `<table class="${cls}"><tbody>${d.hours
    .map((h) => {
      const i = h.indexOf(": ");
      const day = i > 0 ? h.slice(0, i) : h;
      const time = i > 0 ? h.slice(i + 2) : "";
      return `<tr><th scope="row">${esc(day)}</th><td>${esc(time)}</td></tr>`;
    })
    .join("")}</tbody></table>`;
}

function mapEmbed(c: Ctx) {
  const { d, o } = c;
  if (!d.showMap || !d.address) return "";
  const q = encodeURIComponent(`${d.name}, ${d.address}`);
  if (o.forPdf) return `<div class="map map-pdf rv">${icon("pin", 36)}<span>${esc(d.address)}</span></div>`;
  return `<iframe class="map rv" title="${esc(c.ui.findUs)}" loading="lazy" src="https://maps.google.com/maps?q=${q}&output=embed"></iframe>`;
}

/** Divide o texto do "sobre" em uma frase de abertura e o resto */
function splitAbout(text: string) {
  const m = /^(.{20,220}?[.!?])\s+([\s\S]+)$/.exec(text.trim());
  return m ? [m[1], m[2]] : [text.trim(), ""];
}

/* ---------------- Cabeçalho ---------------- */
function header(c: Ctx) {
  const { d, ui } = c;
  const h = d.hidden ?? {};
  const links = [
    !h.services && d.services.length ? `<a href="#services">${esc(ui.services)}</a>` : "",
    !h.about && d.about ? `<a href="#about">${esc(ui.about)}</a>` : "",
    !h.contact ? `<a href="#contact">${esc(ui.contact)}</a>` : "",
  ].join("");
  const call = d.phone ? `<a class="btn btn-sm" href="${telHref(d)}">${icon("phone", 16)}<span>${esc(d.phone)}</span></a>` : "";
  return `<header class="top"><div class="wrap bar"><a class="wm" href="#top">${wordmark(c)}</a><nav aria-label="Menu">${links}</nav>${call}</div></header>`;
}

/** Foto do topo como fundo (enviada ou de banco); vazio se não houver */
function heroSrc(c: Ctx) {
  if (c.d.heroImage) return c.d.heroImage;
  const s = stock(c, "hero");
  return s ? photoUrl(s.id, 1920) : "";
}
const heroAlt = (c: Ctx) => esc(stock(c, "hero")?.alt ?? c.d.name);
const photoDiv = (c: Ctx, src: string, cls = "hp-img") =>
  `<div class="${cls}" role="img" aria-label="${heroAlt(c)}" style="background-image:url('${src}')"></div>`;

/** Bloco de texto do topo, comum às composições com foto */
function heroCopy(c: Ctx, center = false) {
  const { d, p, f } = c;
  const head = d.headline || d.name;
  const hx = p.deco?.h1Grad ? " grad" : "";
  const w = center ? 84 : 50;
  const title = p.nameTitle
    ? `<h1 class="h1 mon-t${hx} rise" style="${fs(d.name, f, center ? 86 : 50, [...d.name].length > 18 ? 2 : 1, 48, 200, 34, 110, [...d.name].length > 9 ? 2 : 1)}">${esc(d.name)}</h1><p class="statement rise" style="--i:1">${esc(head)}</p>`
    : `<h1 class="h1${hx} rise" style="${fs(head, f, w, 2, 40, center ? 120 : 112, 28, 72)}">${esc(head)}</h1>`;
  const sub = d.sub ? `<p class="lead rise" style="--i:2">${esc(d.sub)}</p>` : "";
  const tel = p.phoneInHero && d.phone
    ? `<a class="tel-big rise" style="--i:3" href="${telHref(d)}" aria-label="${esc(c.ui.callNow)}: ${esc(d.phone)}">${icon("phone", 34, "currentColor", 2.2)}<span>${esc(d.phone)}</span></a>`
    : "";
  return `${title}${sub}${tel}<div class="rise" style="--i:4">${ctas(c)}${rating(c)}</div>`;
}

/* ---------------- Topo (9 composições) ---------------- */
function hero(c: Ctx) {
  const { d, p, f } = c;
  const fk = field(c, "hero");
  const style = "";
  const hx = p.deco?.h1Grad ? " grad" : "";
  const sub = d.sub ? `<p class="lead rise" style="--i:2">${esc(d.sub)}</p>` : "";
  const head = d.headline || d.name;
  const src = heroSrc(c);
  const photoKinds = ["immersive", "fade", "centered"];
  const kind = p.hero === "phone" && !d.phone ? "statement" : photoKinds.includes(p.hero) && !src ? (p.hero === "centered" ? "monument" : "statement") : p.hero;

  if (kind === "immersive") {
    // a foto e o degradê ficam no palco (stage), atrás do cabeçalho também
    return `<section class="hero h-imm" data-sec="hero" id="top"><div class="wrap"><div class="imm-copy">${heroCopy(c)}</div></div></section>`;
  }

  if (kind === "fade") {
    // a foto fica no palco (atrás do cabeçalho) e se funde ao fundo por máscara
    return `<section class="hero h-fade" data-sec="hero" id="top"><div class="wrap"><div class="fade-copy">${heroCopy(c)}</div></div></section>`;
  }

  if (kind === "centered") {
    return `<section class="hero h-cen" data-sec="hero" id="top"><div class="wrap cen-in">${heroCopy(c, true)}</div>
<div class="cen-media rise" style="--i:5">${photoDiv(c, src)}</div></section>`;
  }


  if (kind === "monument") {
    const len = [...d.name].length;
    const long = len > 22;
    return `<section class="hero h-mon" data-sec="hero" id="top" style="${style}"><div class="wrap">
<h1 class="mon rise" style="${fs(d.name, f, 92, long ? 2 : 1, 56, long ? 170 : 240, 34, 120, len > 9 ? 2 : 1)}">${esc(d.name)}</h1>
<div class="g mon-row">
<div class="mon-copy"><p class="statement rise" style="--i:1">${esc(head)}</p>${sub}<div class="rise" style="--i:3">${ctas(c)}${rating(c)}</div></div>
<div class="mon-media rise" style="--i:4">${media(c, "", fk)}</div>
</div></div></section>`;
  }

  if (kind === "split") {
    return `<section class="hero h-split" data-sec="hero" id="top" style="${style}">
<div class="split-a"><div class="split-in"><h1 class="h1${hx} rise" style="${fs(head, f, 46, 2, 40, 120, 28, 72)}">${esc(head)}</h1>${sub}<div class="rise" style="--i:3">${ctas(c)}${rating(c)}</div></div></div>
<div class="split-b rise" style="--i:2">${media(c, "split-media", fk)}</div>
</section>`;
  }

  if (kind === "phone") {
    return `<section class="hero h-phone" data-sec="hero" id="top" style="${style}"><div class="wrap">
<div class="g"><div class="ph-copy"><h1 class="h1${hx} rise" style="${fs(head, f, 56, 2, 40, 132, 28, 76)}">${esc(head)}</h1>${sub}</div>
<div class="ph-media rise" style="--i:3">${media(c, "", fk)}</div></div>
<a class="tel-mon rise" style="--i:4;${fs(d.phone, { ...f, upper: false, cw: f.cw * 1.05 }, 92, 1, 48, 240, 40, 110)}" href="${telHref(d)}" aria-label="${esc(c.ui.callNow)}: ${esc(d.phone)}">${esc(d.phone)}</a>
<div class="rise" style="--i:5">${ctas(c)}${rating(c)}</div>
</div></section>`;
  }

  if (kind === "poster") {
    return `<section class="hero h-poster" data-sec="hero" id="top" style="${style}"><div class="wrap">
<h1 class="h1${hx} poster-h rise" style="${fs(head, f, 92, 2, 52, 260, 30, 120)}">${esc(head)}</h1>
<div class="g poster-row"><div class="poster-copy">${sub}<div class="rise" style="--i:3">${ctas(c)}${rating(c)}</div></div>
<div class="poster-media rise" style="--i:4">${media(c, "", fk)}</div></div>
</div></section>`;
  }

  if (kind === "quiet") {
    return `<section class="hero h-quiet" data-sec="hero" id="top" style="${style}"><div class="wrap">
<div class="g"><h1 class="h1${hx} q-h rise" style="${fs(head, f, 52, 2, 36, 96, 28, 52)}">${esc(head)}</h1>
<div class="q-r">${sub}<div class="rise" style="--i:3">${ctas(c)}${rating(c)}</div></div></div>
<div class="q-media rise" style="--i:4">${media(c, "", fk)}</div>
</div></section>`;
  }

  // statement
  return `<section class="hero h-stat" data-sec="hero" id="top" style="${style}"><div class="wrap g">
<div class="st-copy"><h1 class="h1${hx} rise" style="${fs(head, f, 54, 2, 42, 136, 28, 76)}">${esc(head)}</h1>${p.deco?.underline ? brushStroke(c.pal.accent) : ""}${sub}<div class="rise" style="--i:3">${ctas(c)}${rating(c)}</div></div>
<div class="st-media rise" style="--i:3">${media(c, "", fk)}</div>
</div></section>`;
}

/** Textura nas faixas coloridas (só nas de cor chapada, para não pesar nas claras) */
function bandBg(c: Ctx, kind: FieldKind) {
  const pk = c.p.deco?.bandPattern;
  if (!pk || kind === "ground" || kind === "tone") return "";
  return `;background-image:${pattern(pk, fieldVars(c.pal, kind).fg, 0.13)}`;
}

/* ---------------- Assinaturas do nicho ---------------- */
function signature(c: Ctx) {
  const { d, p, ui } = c;
  const style = fieldCss(c.pal, field(c, "sig", "accent")) + bandBg(c, field(c, "sig", "accent"));
  if (p.sig === "callband" && d.phone)
    return `<section class="sec sig-call" style="${style}"><div class="wrap g">
<h2 class="h2 rv">${esc(ui.callNow)}</h2>
<div class="call-r"><a class="call-tel rv" style="--i:1" href="${telHref(d)}">${esc(d.phone)}</a>${d.whatsapp ? `<a class="btn rv" style="--i:2" href="${waHref(d)}" target="_blank" rel="noopener">${icon("chat", 18)}<span>WhatsApp</span></a>` : ""}</div>
</div></section>`;
  if (p.sig === "timetable" && d.hours.length)
    return `<section class="sec sig-time" style="${style}"><div class="wrap g">
<h2 class="h2 rv">${esc(ui.hours)}</h2>
<div class="time-r rv" style="--i:1">${hoursTable(c, "hrs big")}</div>
</div></section>`;
  return "";
}

/* ---------------- Serviços (6 composições) ---------------- */
function services(c: Ctx) {
  const { d, p, ui, pal } = c;
  if (!d.services.length) return "";
  const fk = field(c, "services");
  const style = fieldCss(pal, fk);
  const items = d.services;
  let body = "";

  if (p.services === "rows" || p.services === "board") {
    body = `<ul class="${p.services === "board" ? "board" : "rows"}">${items
      .map((s, i) => `<li class="rv" style="--i:${i % 3}"><h3>${esc(s.title)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</li>`)
      .join("")}</ul>`;
  } else if (p.services === "menu") {
    body = `<ul class="menu">${items
      .map((s, i) => `<li class="rv" style="--i:${i % 2}"><h3><span class="bul mf" aria-hidden="true"></span>${esc(s.title)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</li>`)
      .join("")}</ul>`;
  } else if (p.services === "checklist") {
    body = `<ul class="checks">${items
      .map((s, i) => `<li class="rv" style="--i:${i % 2}"><span class="ck">${icon("check", 22, "currentColor", 2.6)}</span><div><h3>${esc(s.title)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</div></li>`)
      .join("")}</ul>`;
  } else if (p.services === "swatches") {
    // Cartela de tintas: tons da cor do negócio, com o código de cada tom
    const tones = [0, 0.3, 0.55, 0.78, -0.3, -0.55].map((t) => (t >= 0 ? mix(pal.accent, "#ffffff", t) : mix(pal.accent, "#000000", -t)));
    body = `<ul class="tiles swatches">${items
      .map((s, i) => {
        const bg = tones[i % tones.length];
        return `<li class="rv" style="--i:${i % 3};background:${bg};color:${onColor(bg, pal.dark)}"><span class="chip">${bg.toUpperCase()}</span><h3>${esc(s.title)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</li>`;
      })
      .join("")}</ul>`;
  } else {
    const cycle: FieldKind[] = fk === "accent" ? ["dark", "light", "tone"] : ["accent", "light", "dark", "tone"];
    body = `<ul class="tiles">${items
      .map((s, i) => {
        const v = fieldVars(pal, cycle[i % cycle.length]);
        return `<li class="rv" style="--i:${i % 3};background:${v.bg};color:${v.fg}"><h3>${esc(s.title)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</li>`;
      })
      .join("")}</ul>`;
  }

  return `<section class="sec svc svc-${p.services}" data-sec="services" id="services" style="${style}"><div class="wrap">
<h2 class="h2 rv">${esc(ui.services)}</h2>${body}</div></section>`;
}

/* ---------------- Por que escolher (3 composições) ---------------- */
function why(c: Ctx) {
  const { d, p, ui } = c;
  if (!d.benefits.length) return "";
  const style = fieldCss(c.pal, field(c, "why")) + bandBg(c, field(c, "why"));
  const list = d.benefits
    .map((b, i) => `<li class="rv" style="--i:${i}">${p.why === "columns" ? `<span class="bul big mf" aria-hidden="true"></span>` : ""}<h3>${esc(b.title)}</h3>${b.desc ? `<p>${esc(b.desc)}</p>` : ""}</li>`)
    .join("");
  return `<section class="sec why why-${p.why}" data-sec="why" style="${style}"><div class="wrap">
<h2 class="h2 rv">${esc(ui.why)}</h2><ul class="why-l">${list}</ul></div></section>`;
}

/* ---------------- Sobre (2 composições) ---------------- */
function about(c: Ctx) {
  const { d, p, ui } = c;
  if (!d.about) return "";
  const fk = field(c, "about");
  const style = fieldCss(c.pal, fk);
  const [first, rest] = splitAbout(d.about);
  const text = `<p class="statement rv" style="--i:1">${esc(first)}</p>${rest ? `<p class="body rv" style="--i:2">${esc(rest)}</p>` : ""}`;

  if (p.about === "media") {
    return `<section class="sec about about-media" data-sec="about" id="about" style="${style}"><div class="wrap g">
<div class="ab-media rv">${seal(c, fk)}</div>
<div class="ab-copy"><h2 class="h2 rv">${esc(ui.about)}</h2>${text}</div>
</div></section>`;
  }

  const facts: string[] = [];
  if (d.city || d.address) facts.push(`<div><dt>${esc(ui.address)}</dt><dd>${esc(d.address || d.city)}</dd></div>`);
  if (d.phone) facts.push(`<div><dt>${esc(ui.phone)}</dt><dd><a href="${telHref(d)}">${esc(d.phone)}</a></dd></div>`);
  if (d.showRating && d.rating) facts.push(`<div><dt>Google</dt><dd>${d.rating.toFixed(1)} · ${d.reviews ?? ""} ${esc(ui.rating)}</dd></div>`);
  if (d.email) facts.push(`<div><dt>${esc(ui.email)}</dt><dd><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></dd></div>`);
  return `<section class="sec about about-facts" data-sec="about" id="about" style="${style}"><div class="wrap g">
<div class="ab-copy"><h2 class="h2 rv">${esc(ui.about)}</h2>${text}</div>
${facts.length ? `<dl class="facts rv" style="--i:2">${facts.join("")}</dl>` : ""}
</div></section>`;
}

/* ---------------- Contato ---------------- */
function contact(c: Ctx) {
  const { d, ui, f } = c;
  const style = fieldCss(c.pal, field(c, "contact", "dark"));
  const lines: string[] = [];
  if (d.phone) lines.push(`<a class="ct-tel rv" style="--i:1;${fs(d.phone, { ...f, upper: false }, 46, 1, 36, 104, 34, 64)}" href="${telHref(d)}">${esc(d.phone)}</a>`);
  if (d.email) lines.push(`<p class="ct-line rv" style="--i:2">${icon("mail", 20)}<a href="mailto:${esc(d.email)}">${esc(d.email)}</a></p>`);
  if (d.address) lines.push(`<p class="ct-line rv" style="--i:2">${icon("pin", 20)}<span>${esc(d.address)}</span></p>`);
  const hrs = c.p.sig === "timetable" ? "" : hoursTable(c);
  return `<section class="sec ct" data-sec="contact" id="contact" style="${style}"><div class="wrap">
<div class="g ct-g"><div class="ct-a"><h2 class="h2 rv">${esc(ui.contact)}</h2>${lines.join("")}<div class="rv" style="--i:3">${ctas(c)}</div></div>
${hrs ? `<div class="ct-b rv" style="--i:2"><h3>${esc(ui.hours)}</h3>${hrs}</div>` : ""}</div>
${mapEmbed(c)}
</div></section>`;
}

function footer(c: Ctx) {
  const { d, ui, f } = c;
  const style = fieldCss(c.pal, field(c, "footer", "ground"));
  const year = new Date().getFullYear();
  return `<footer class="ft" style="${style}"><div class="wrap">
<div class="ft-name" aria-hidden="true" style="${fs(d.name, f, 92, 1, 40, 280, 36, 120)}">${esc(d.name)}</div>
<div class="ft-row"><span>© ${year} ${esc(d.name)}. ${esc(ui.rights)}</span>${d.address ? `<span>${esc(d.address)}</span>` : ""}</div>
</div></footer>`;
}

function stickyBar(c: Ctx) {
  const { d, o, ui } = c;
  if (o.forPdf || !d.phone) return "";
  return `<div class="sticky"><a class="btn" href="${telHref(d)}">${icon("phone", 18)}<span>${esc(ui.callNow)}</span></a>${
    d.whatsapp ? `<a class="btn wa" href="${waHref(d)}" target="_blank" rel="noopener">${icon("chat", 18)}<span>WhatsApp</span></a>` : ""
  }</div>`;
}

function badge(c: Ctx) {
  return c.d.showDemoBadge ? `<div class="demo-badge">${esc(c.ui.demo)}</div>` : "";
}

/* ---------------- CSS ---------------- */
function css(c: Ctx) {
  const { f, p, pal } = c;
  const m = MOTIFS[p.motif] as { radius?: string; clip?: string; mask?: string };
  const rb = p.btn === "pill" ? "999px" : "0";
  const rc = p.btn === "pill" ? "22px" : "0";
  const motif = [
    m.radius ? `border-radius:${m.radius}` : "",
    m.clip ? `clip-path:${m.clip}` : "",
    m.mask ? `-webkit-mask:${m.mask} center/100% 100% no-repeat;mask:${m.mask} center/100% 100% no-repeat` : "",
  ]
    .filter(Boolean)
    .join(";");
  const up = f.upper ? "uppercase" : "none";

  return `
*{box-sizing:border-box;margin:0;padding:0}
:root{${fieldCss(pal, "ground")};--fd:${f.display},system-ui,sans-serif;--ft:${f.text},system-ui,sans-serif;--dw:${f.weight};--dt:${f.track}em;--dl:${f.lead};--dc:${up};--tw:${f.textWeight ?? 400};
--m:clamp(20px,3.2vw,48px);--gap:clamp(16px,2vw,32px);--sec:clamp(80px,8.4vw,124px);--h2m:${Math.min(9.5, 5.2 / (f.cw * (f.upper ? 1.22 : 1))).toFixed(2)}vw;--rb:${rb};--rc:${rc};
--ease-out:cubic-bezier(.23,1,.32,1);--ease-io:cubic-bezier(.77,0,.175,1)}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font:var(--tw) 18px/1.55 var(--ft);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;overflow-x:hidden}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}ul,ol{list-style:none}
h1,h2,h3{font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);text-transform:var(--dc);text-wrap:balance}
p{text-wrap:pretty}
:focus-visible{outline:3px solid var(--act);outline-offset:3px}
::selection{background:${pal.accent};color:${pal.onAccent}}
.wrap{max-width:1680px;margin:0 auto;padding:0 var(--m)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
.sec{padding:var(--sec) 0}
.h1{font-size:var(--fs);line-height:var(--dl)}
.h2{font-size:clamp(42px,5.4vw,104px);line-height:var(--dl);margin-bottom:clamp(40px,4.5vw,72px);max-width:16ch}
h3{font-size:clamp(24px,2.3vw,36px);line-height:1.05}
.lead{font-size:clamp(19px,1.45vw,22px);line-height:1.5;max-width:34em;margin-top:clamp(24px,2.6vw,40px)}
.statement{font-family:var(--fd);font-weight:var(--dw);letter-spacing:calc(var(--dt) * .6);font-size:clamp(24px,2.3vw,36px);line-height:1.18;max-width:24em}
.body{max-width:36em;margin-top:24px}
.up .statement{font-family:var(--ft);font-weight:500;letter-spacing:-.01em;text-transform:none;line-height:1.3}
.mf{${motif}}
/* botões: retos ou em pílula, decidido uma vez; resposta ao toque em 160ms */
.btn{display:inline-flex;align-items:center;gap:10px;min-height:54px;padding:0 26px;border-radius:var(--rb);background:var(--act);color:var(--on-act);font:600 18px/1 var(--ft);letter-spacing:0;text-transform:none;white-space:nowrap;
transition:transform 160ms var(--ease-out),opacity 200ms ease;touch-action:manipulation;user-select:none}
.btn:active{transform:scale(.97)}
.btn-alt{background:var(--surf);color:var(--fg)}
.btn-sm{min-height:44px;padding:0 18px;font-size:15px}
@media(hover:hover) and (pointer:fine){.btn:hover{opacity:.88}nav a:hover,.ct-line a:hover,.facts a:hover{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px}}
.acts{display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(28px,3vw,44px)}
.rating{display:flex;align-items:center;gap:8px;margin-top:22px;font-size:15px}.rating span{color:var(--mut)}
/* cabeçalho: marca, três links, uma ação */
.top .bar{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:88px}
.wm{display:flex;align-items:center;min-width:0}
.wm-name{font:var(--dw) 21px/1.1 var(--fd);letter-spacing:var(--dt);text-transform:var(--dc);max-width:22ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wm-img{height:48px;width:auto;object-fit:contain}
nav{display:flex;gap:32px;font-size:15px;font-weight:500;margin-left:auto}
/* imagens */
.media{position:relative;overflow:hidden;width:100%;background:var(--surf)}
.media img{width:100%;height:100%;object-fit:cover}
.plate{display:grid;place-items:center}.plate svg{width:38%;height:auto}
.seal{display:grid;place-items:center}.seal span{font:var(--dw) clamp(96px,14vw,240px)/1 var(--fd);letter-spacing:var(--dt);text-transform:var(--dc)}
/* personalidade: palco do topo, faixa, elementos flutuantes, divisória, moldura */
.stage{position:relative}
.strip{height:12px}
.hero{position:relative;overflow:hidden}
.hero>*:not(.fl){position:relative;z-index:1}
.fl{position:absolute;inset:0;pointer-events:none;z-index:0}
.fl span{position:absolute;display:block;animation:bob var(--t) ease-in-out var(--d) infinite alternate}
.fl svg{display:block}
@keyframes bob{from{transform:translateY(0) rotate(0)}to{transform:translateY(-24px) rotate(14deg)}}
.dv{line-height:0;position:relative;z-index:2}.dv svg{display:block;width:100%;height:clamp(34px,5.6vw,88px)}
.dv-drips svg{height:clamp(44px,6.4vw,100px)}
.grad{background:linear-gradient(100deg,var(--fg) 25%,var(--act-t) 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
.brush{display:block;width:min(72%,440px);height:20px;margin-top:14px}
.mw{position:relative;isolation:isolate}
.mw .fr{position:absolute;inset:0;z-index:-1;background:var(--frc)}
.mw.offset .fr{transform:translate(clamp(10px,1.4vw,22px),clamp(10px,1.4vw,22px))}
.mw.glow .fr{transform:scale(1.05);filter:blur(36px);opacity:.7}
.mw.ring .fr{transform:scale(1.06) rotate(-3deg);opacity:.5}
.plate{position:relative}
.ph{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat;animation:drift 22s ease-in-out infinite alternate}
/* aviso acima do título (promoção, novidade) */
.note{display:inline-flex;align-items:center;max-width:100%;margin-bottom:clamp(18px,2vw,28px);padding:9px 16px;border-radius:var(--rb);background:var(--act);color:var(--on-act);font:600 15px/1.3 var(--ft);letter-spacing:0;text-transform:none;text-wrap:balance}
.h-mon .note{margin-top:8px}
/* topos com foto: imersivo, lateral suave e centralizado */
.hp-img{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat}
.stage.has-imm{overflow:hidden;isolation:isolate}
.imm-bg{z-index:-2;animation:drift 26s ease-in-out infinite alternate}
.imm-scrim{position:absolute;inset:0;z-index:-1;background:var(--scrim)}
.h-imm{min-height:min(84svh,880px);display:flex;align-items:center;padding:clamp(40px,6vw,96px) 0 clamp(72px,8vw,128px)}
.h-imm .wrap{width:100%}
.imm-copy{max-width:min(46rem,58%)}
.tel-big{display:inline-flex;align-items:center;gap:14px;margin-top:clamp(28px,3vw,44px);font:var(--dw) clamp(40px,4.6vw,84px)/1 var(--fd);letter-spacing:var(--dt);color:var(--act-t);font-variant-numeric:tabular-nums;white-space:nowrap;transition:transform 200ms var(--ease-out)}
.tel-big:active{transform:scale(.985)}
.tel-big svg{width:.6em;height:.6em;flex:none}
.h-fade{min-height:min(84svh,860px);display:flex;align-items:center;padding:clamp(40px,6vw,96px) 0 clamp(72px,8vw,120px)}
.h-fade .wrap{width:100%}
.fade-bg{position:absolute;top:0;right:0;bottom:0;width:60%;z-index:-1;overflow:hidden;
-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 46%),linear-gradient(0deg,transparent 0%,#000 26%);-webkit-mask-composite:source-in;
mask-image:linear-gradient(90deg,transparent 0%,#000 46%),linear-gradient(0deg,transparent 0%,#000 26%);mask-composite:intersect}
.fade-bg .hp-img{animation:drift 26s ease-in-out infinite alternate}
.fade-copy{position:relative;max-width:min(44rem,46%)}
.h-cen{padding-top:clamp(40px,6vw,96px)}
.cen-in{text-align:center;display:flex;flex-direction:column;align-items:center}
.cen-in .lead,.cen-in .statement{margin-left:auto;margin-right:auto}
.cen-in .acts,.cen-in .rating{justify-content:center}
.mon-t{line-height:.9;letter-spacing:var(--dt)}
.h-cen .statement{margin-top:clamp(20px,2.4vw,32px)}
.cen-media{position:relative;height:clamp(320px,48vw,680px);margin-top:clamp(32px,4vw,64px);overflow:hidden;
-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 34%,#000 74%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 34%,#000 74%,transparent 100%)}
.cen-media .hp-img{animation:drift 26s ease-in-out infinite alternate}
.media.soft{border-radius:var(--rc)}
/* topo: afirmação */
.h-stat .g{align-items:end;padding-top:clamp(32px,5vw,88px);padding-bottom:clamp(64px,7vw,112px)}
.st-copy{grid-column:1/8;padding-bottom:clamp(0px,2vw,24px)}
.st-media{grid-column:8/13}.st-media .media{aspect-ratio:4/5}
/* topo: monumento */
.h-mon{padding:clamp(16px,3vw,40px) 0 clamp(64px,7vw,112px)}
.mon{font-size:var(--fs);line-height:.86;margin-left:-.04em;overflow-wrap:anywhere}
.mon-row{margin-top:clamp(40px,5vw,80px);align-items:end}
.mon-copy{grid-column:1/7}.mon-copy .lead{margin-top:24px}
.mon-media{grid-column:7/13}.mon-media .media{aspect-ratio:16/10}
/* topo: palco dividido */
.h-split{display:grid;grid-template-columns:1fr 1fr;min-height:min(92svh,980px)}
.split-a{display:flex;align-items:flex-end;padding:clamp(56px,7vw,120px) clamp(24px,4vw,72px) clamp(56px,6vw,96px) var(--m)}
.split-in{max-width:44rem}
.split-b{position:relative;min-height:420px}.split-b .media{position:absolute;inset:0;height:100%}
.split-b .plate svg{width:30%}
/* topo: telefone */
.h-phone{padding:clamp(32px,5vw,88px) 0 clamp(56px,6vw,96px)}
.ph-copy{grid-column:1/9}
.ph-media{grid-column:9/13;align-self:end}.ph-media .media{aspect-ratio:1/1}
.tel-mon{display:block;font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);font-size:var(--fs);line-height:1;color:var(--act-t);margin-top:clamp(40px,5vw,80px);white-space:nowrap;font-variant-numeric:tabular-nums;transition:transform 200ms var(--ease-out);width:max-content;max-width:100%}
.tel-mon:active{transform:scale(.985)}
/* topo: cartaz */
.h-poster{padding:clamp(32px,5vw,80px) 0 clamp(56px,6vw,96px)}
.poster-h{margin-left:-.03em}
.poster-row{margin-top:clamp(32px,4vw,64px);align-items:end}
.poster-copy{grid-column:1/7}.poster-copy .lead{margin-top:0}
.poster-media{grid-column:8/13}.poster-media .media{aspect-ratio:3/2}
/* topo: discreto */
.h-quiet{padding:clamp(48px,7vw,128px) 0 clamp(64px,7vw,112px)}
.h-quiet .g{align-items:end}
.q-h{grid-column:1/7}
.q-r{grid-column:8/13}.q-r .lead{margin-top:0}
.q-media{margin-top:clamp(48px,6vw,96px)}.q-media .media{aspect-ratio:21/9}
.q-media .plate svg{width:14%}
/* assinaturas */
.sig-call .g,.sig-time .g{align-items:start}
.sig-call .h2,.sig-time .h2{grid-column:1/6;margin-bottom:24px}
.call-r{grid-column:6/13;display:flex;flex-direction:column;align-items:flex-start;gap:28px}
.call-tel{font:var(--dw) clamp(44px,6.4vw,124px)/1 var(--fd);letter-spacing:var(--dt);font-variant-numeric:tabular-nums;white-space:nowrap;max-width:100%;transition:transform 200ms var(--ease-out)}
.call-tel:active{transform:scale(.985)}
.time-r{grid-column:6/13}
/* horários: tabela real, linhas separadas por tom e não por fio */
.hrs{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.hrs th,.hrs td{padding:12px 16px;text-align:left;font-weight:500}
.hrs td{text-align:right;white-space:nowrap}
.hrs tr:nth-child(odd){background:var(--surf)}
.hrs th::first-letter{text-transform:uppercase}
.hrs.big th,.hrs.big td{font:var(--dw) clamp(22px,2.1vw,34px)/1.1 var(--fd);letter-spacing:calc(var(--dt) * .5);text-transform:var(--dc);padding:18px 20px}
/* serviços */
.rows li,.board li{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap);padding:clamp(22px,2.4vw,36px) 0}
.rows h3,.board h3{grid-column:1/7}
.rows p,.board p{grid-column:7/13;max-width:34em;padding-top:4px}
.rows li+li{padding-top:clamp(22px,2.4vw,36px)}
.board{margin:0 calc(var(--m) * -1)}
.board li{padding-left:var(--m);padding-right:var(--m)}
.board li:nth-child(odd){background:var(--surf)}
.board h3{font-size:clamp(34px,4.6vw,84px);line-height:.95}
.menu{display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(32px,6vw,120px);row-gap:clamp(36px,4vw,64px)}
.menu h3{display:flex;align-items:baseline;gap:16px}.menu p{margin-top:12px;max-width:30em;padding-left:30px}
.bul{display:inline-block;width:14px;height:14px;flex:none;background:var(--act)}
.bul.big{width:48px;height:48px;margin-bottom:28px}
.checks{display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(32px,6vw,120px);row-gap:clamp(32px,3.6vw,56px)}
.checks li{display:flex;gap:20px;align-items:flex-start}
.ck{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:var(--rb);background:var(--act);color:var(--on-act)}
.checks p{margin-top:10px;max-width:30em}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:8px;margin:0 calc(var(--m) * -1 + 8px)}
.tiles li{min-height:clamp(240px,22vw,340px);padding:clamp(24px,2.4vw,40px);display:flex;flex-direction:column;justify-content:flex-end;gap:14px;border-radius:var(--rc)}
.tiles h3{font-size:clamp(24px,2.3vw,36px)}.tiles p{max-width:28em}
.swatches .chip{margin-bottom:auto;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
/* por que escolher */
.why-l{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(32px,4vw,72px)}
.why-l p{margin-top:16px;max-width:26em}
.why-stack .why-l{grid-template-columns:1fr;gap:0}
.why-stack li{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap);padding:clamp(24px,3vw,44px) 0}
.why-stack h3{grid-column:1/8;font-size:clamp(34px,4.6vw,84px);line-height:.95}
.why-stack p{grid-column:8/13;margin-top:0;padding-top:8px}

/* sobre */
.about .g{align-items:start}
.about-facts .ab-copy{grid-column:1/8}
.facts{grid-column:9/13;display:grid;gap:24px;align-self:end}
.facts>div{display:grid;grid-template-columns:7.5em 1fr;gap:16px;align-items:baseline}
.facts dt{font-size:15px;color:var(--mut)}
.facts dd{font:var(--dw) clamp(24px,2.3vw,36px)/1.15 var(--fd);letter-spacing:calc(var(--dt) * .5);overflow-wrap:anywhere}
.about-media .ab-media{grid-column:1/6}.about-media .ab-copy{grid-column:7/13}
.ab-media .media{aspect-ratio:4/5}
.ab-copy .h2{margin-bottom:32px}
/* contato */
.ct-g{align-items:start}
.ct-a{grid-column:1/8}.ct-b{grid-column:8/13}
.ct .h2{margin-bottom:clamp(28px,3vw,48px)}
.ct-tel{display:block;font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);font-size:var(--fs);line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;margin-bottom:28px;width:max-content;max-width:100%}
.ct-line{display:flex;gap:14px;align-items:center;font-size:21px;margin-top:14px;overflow-wrap:anywhere}
.ct-line svg{flex:none;color:var(--mut)}
.ct-b h3{margin-bottom:16px}
.map{display:block;width:100%;height:clamp(300px,32vw,460px);border:0;margin-top:clamp(48px,5vw,80px);border-radius:var(--rc);background:var(--surf)}
.map-pdf{display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;text-align:center;font-weight:600}
/* rodapé: o nome volta de ponta a ponta */
.ft{padding:clamp(64px,7vw,120px) 0 28px}
.ft-name{font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);text-transform:var(--dc);font-size:var(--fs);line-height:.9;margin-left:-.04em;overflow-wrap:anywhere}
.ft-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px;margin-top:40px;font-size:15px;color:var(--mut)}
/* barra fixa no celular e selo de demonstração */
.sticky{display:none}
.demo-badge{position:fixed;bottom:14px;left:14px;z-index:60;background:#111;color:#fff;font:600 13px/1 var(--ft);padding:9px 12px;border-radius:999px}
/* movimento: entrada do topo em sequência e seções que sobem ao entrar na tela */
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes drift{from{transform:scale(1.001)}to{transform:scale(1.06)}}
.rise{animation:rise 760ms var(--ease-out) both;animation-delay:calc(var(--i,0) * 80ms)}
.media img,.plate>svg{animation:drift 20s ease-in-out infinite alternate}
@supports (animation-timeline:view()){
 .rv{animation:rise linear forwards;animation-timeline:view();animation-range:entry 0% cover calc(22% + var(--i,0) * 6%)}
}
@media(prefers-reduced-motion:reduce){.rise,.rv,.media img,.plate svg,.ph,.fl span,.hp-img{animation:none}html{scroll-behavior:auto}}
/* tablet: o topo vira uma coluna, com o título no tamanho calculado para a largura toda */
@media(max-width:1080px){
 nav{display:none}
 .h1,.mon,.poster-h{font-size:var(--fsm)}
 .fl span:nth-child(-n+5){display:none}
 .imm-copy{max-width:72%}
 .fade-copy{max-width:52%}
 .hero .g>*{grid-column:1/-1!important}
 .st-media,.mon-media,.poster-media,.q-r{margin-top:48px}
 .st-media .media,.mon-media .media,.poster-media .media{aspect-ratio:16/10}
 .ph-media{display:none}
 .h-split{grid-template-columns:1fr;min-height:0}
 .split-a{padding:64px var(--m) 56px}
 .split-b{min-height:0}.split-b .media{position:static;aspect-ratio:16/10}
 .rows h3,.board h3{grid-column:1/6}.rows p,.board p{grid-column:6/13}
 .why-l{grid-template-columns:1fr}
 .why-band li,.why-columns li{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
 .why-band h3,.why-columns h3{grid-column:1/7}.why-band p,.why-columns p{grid-column:7/13;margin-top:0}
 .why-columns .bul.big{grid-column:1/-1;margin-bottom:20px}
 .ct-a,.ct-b{grid-column:1/-1}.ct-b{margin-top:56px}
}
/* celular: uma composição própria, em uma coluna */
@media(max-width:760px){
 body{font-size:17px;padding-bottom:84px}
 .fl span:nth-child(-n+6){display:none}
 /* no celular a foto fica entre o cabeçalho e o título, sem passar por trás de nenhum texto */
 .imm-scrim{display:none}
 .imm-bg{top:72px;bottom:auto;height:44vh;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%)}
 .h-imm{min-height:0;align-items:flex-end;padding:calc(44vh + 8px) 0 56px}
 .imm-copy,.fade-copy{max-width:none}
 .h-fade{min-height:0;align-items:flex-end;padding:calc(44vh + 8px) 0 56px}
 .fade-bg{top:72px;width:100%;bottom:auto;height:44vh;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%);-webkit-mask-composite:source-over;mask-composite:add}
 .cen-media{height:56vw;min-height:240px}
 .h1,.mon,.tel-mon,.ct-tel,.ft-name,.poster-h{font-size:var(--fsm)}
 .g>*,.rows li>*,.board li>*,.why-stack li>*,.why-band li>*,.why-columns li>*{grid-column:1/-1!important}
 .top .bar{min-height:72px}.top .btn{display:none}
 .h2{margin-bottom:36px;font-size:clamp(28px,var(--h2m),48px)}
 .st-media,.mon-media,.poster-media,.ph-media,.ab-media,.facts,.ct-b,.call-r,.time-r,.q-r{margin-top:40px}
 .st-media .media{aspect-ratio:4/3}
 .ph-media{display:none}
 .h-split{grid-template-columns:1fr;min-height:0}
 .split-a{padding:56px var(--m) 48px}
 .split-b{min-height:0}.split-b .media{position:static;aspect-ratio:4/3}
 .q-media .media{aspect-ratio:4/3}.q-media .plate svg{width:28%}
 .menu,.checks{grid-template-columns:1fr}
 .menu p{padding-left:30px}
 .rows p,.board p,.why-stack p,.why-band p,.why-columns p{margin-top:10px;padding-top:0}
 .tiles{margin:0}
 .tiles li{min-height:200px}
 .facts{align-self:start}
 .ab-media .media{aspect-ratio:1/1}
 .call-tel{font-size:clamp(34px,10.5vw,56px)}
 .hrs.big th,.hrs.big td{font-size:21px;padding:14px 14px}
 .sticky{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;gap:8px;padding:10px var(--m);padding-bottom:max(10px,env(safe-area-inset-bottom));background:var(--bg);box-shadow:0 -8px 24px rgba(0,0,0,.12)}
 .sticky .btn{flex:1;justify-content:center;padding:0 12px}
 .btn{font-size:16px;padding:0 18px;min-height:50px}
 .acts{gap:10px}
 .sticky .wa{background:#157a3c;color:#fff}
 .demo-badge{bottom:92px}
}`;
}

function doc(c: Ctx, body: string) {
  const { d, f } = c;
  return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(d.name)}${d.city ? ` — ${esc(d.city)}` : ""}</title>
<link rel="icon" href="${favicon(d)}"/>
<meta name="description" content="${esc(d.sub)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?${f.q}&display=swap" rel="stylesheet"/>
<style>${css(c)}</style></head><body${f.upper ? ' class="up"' : ""}>${body}</body></html>`;
}

const NO_MOTION = "<style>.rise,.rv,.media img,.plate svg,.ph,.fl span,.hp-img{animation:none!important}*{transition:none!important}</style>";

/** Topo completo: cabeçalho, faixa, topo e a divisória que leva à próxima seção */
function stage(c: Ctx) {
  const { d, p, pal } = c;
  const deco = p.deco ?? {};
  const kind = field(c, "hero");
  const v = fieldVars(pal, kind);
  const layers: string[] = [];
  if (deco.pattern) layers.push(pattern(deco.pattern, v.fg, 0.08));
  if (deco.heroBg) layers.push(heroBackground(deco.heroBg, v.bg, pal.accent, pal.light, pal.dark)!);
  const bg = layers.length ? `;background:${layers.join(",")}${deco.heroBg ? "" : `,${v.bg}`}` : "";
  const stripHtml = deco.strip ? `<div class="strip" aria-hidden="true" style="background:${strip(deco.strip, pal.accent, pal.dark, pal.light)}"></div>` : "";
  let heroHtml = hero(c);
  if (d.heroNote?.trim()) heroHtml = heroHtml.replace("<h1", `<p class="note rise">${esc(d.heroNote.trim())}</p><h1`);
  let imm = "";
  if (heroHtml.includes('class="hero h-fade"')) imm = `<div class="fade-bg">${photoDiv(c, heroSrc(c))}</div>`;
  if (heroHtml.includes('class="hero h-imm"')) {
    const b = v.bg;
    const scrim = `linear-gradient(180deg,${alpha(b, 0.85)} 0,${alpha(b, 0)} 150px),linear-gradient(90deg,${b} 0%,${alpha(b, 0.9)} 28%,${alpha(b, 0.45)} 52%,${alpha(b, 0)} 78%),linear-gradient(0deg,${b} 0%,${alpha(b, 0)} 26%)`;
    const scrimM = `linear-gradient(180deg,${alpha(b, 0.7)} 0,${alpha(b, 0.05)} 26%,${alpha(b, 0.75)} 48%,${b} 64%)`;
    imm = `${photoDiv(c, heroSrc(c), "hp-img imm-bg")}<div class="imm-scrim" style="--scrim:${scrim};--scrim-m:${scrimM}"></div>`;
  }
  if (deco.floaters) heroHtml = heroHtml.replace(/^(<section[^>]*>)/, `$1${floaters(deco.floaters, deco.floaters === "bubbles" || deco.floaters === "snow" ? v.fg : pal.accent)}`);

  // a divisória tem a cor do fim do topo e fica sobre a cor da próxima seção visível
  let dv = "";
  if (deco.divider) {
    const h = d.hidden ?? {};
    const next: FieldKind =
      !h.services && d.services.length ? field(c, "services")
      : p.sig ? field(c, "sig", "accent")
      : !h.why && d.benefits.length ? field(c, "why")
      : !h.about && d.about ? field(c, "about")
      : field(c, "contact", "dark");
    const end = imm.includes("imm-scrim") || !deco.heroBg ? v.bg : heroEnd(deco.heroBg, v.bg, pal.accent, pal.dark);
    dv = `<div class="dv dv-${deco.divider}" style="background:${fieldVars(pal, next).bg}">${divider(deco.divider, end, pal.accent)}</div>`;
  }
  return `<div class="stage${imm ? " has-imm" : ""}" style="${fieldCss(pal, kind)}${bg}">${imm}${header(c)}${stripHtml}${heroHtml}</div>${dv}`;
}

export function renderSite(d: SiteData, o: RenderOptions = {}) {
  const p = presetById(d.template);
  const c: Ctx = { d, p, f: FONTS[p.font], pal: palette(d, p), ui: SITE_UI[d.lang], o };
  const body = [stage(c), "<main>", services(c), signature(c), why(c), about(c), contact(c), "</main>", footer(c), stickyBar(c), badge(c)].join("\n");
  const out = applyBlocks(doc(c, body), d);
  // PDF e miniaturas: sem animação, para a captura sair completa
  return o.forPdf ? out.replace("</head>", NO_MOTION + "</head>") : out;
}
