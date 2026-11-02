import { SITE_UI } from "../data/locales";
import { heroArt, icon } from "./icons";
import { applyBlocks } from "./blocks";
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${d.primary}"/><text x="32" y="42" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${ini.length > 1 ? 26 : 32}" fill="#fff">${ini}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function logo(d: SiteData, onDark = false) {
  if (d.logo) return `<img class="logo-img" src="${d.logo}" alt="${esc(d.name)}"/>`;
  return `<span class="mono" style="background:${d.primary}">${esc(initials(d.name))}</span><span class="brand-name" style="color:${onDark ? "#fff" : d.dark}">${esc(d.name)}</span>`;
}

function hero(d: SiteData, radius: string, fit: "slice" | "meet" = "slice") {
  const inner = d.heroImage
    ? `<img src="${d.heroImage}" alt="${esc(d.name)}" style="width:100%;height:100%;object-fit:cover;display:block"/>`
    : heroArt(d.nicheId, d.primary, d.dark, d.light).replace("xMidYMid slice", `xMidYMid ${fit}`);
  return `<div class="hero-art rise" style="--i:4;border-radius:${radius};background:${d.light}">${inner}</div>`;
}

function map(d: SiteData, o: RenderOptions) {
  if (!d.showMap || !d.address) return "";
  const q = encodeURIComponent(`${d.name}, ${d.address}`);
  if (o.forPdf)
    return `<div class="map map-pdf" style="background:${d.light};color:${d.dark}">${icon("pin", 40, d.primary)}<span>${esc(d.address)}</span></div>`;
  return `<iframe class="map" title="Map" loading="lazy" src="https://maps.google.com/maps?q=${q}&output=embed"></iframe>`;
}

function rating(d: SiteData, color: string) {
  if (!d.showRating || !d.rating) return "";
  const ui = SITE_UI[d.lang];
  return `<div class="rating" style="color:${color}">${icon("star", 18, "#f5b301", 1.5, "#f5b301")}<b>${d.rating.toFixed(1)}</b><span>· ${d.reviews ?? ""} ${esc(ui.rating)}</span></div>`;
}

function contactList(d: SiteData, color: string) {
  const ui = SITE_UI[d.lang];
  const rows: string[] = [];
  if (d.phone) rows.push(`<li>${icon("phone", 20, color)}<div><small>${esc(ui.phone)}</small><a href="${telHref(d)}">${esc(d.phone)}</a></div></li>`);
  if (d.email) rows.push(`<li>${icon("mail", 20, color)}<div><small>${esc(ui.email)}</small><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></div></li>`);
  if (d.address) rows.push(`<li>${icon("pin", 20, color)}<div><small>${esc(ui.address)}</small><span>${esc(d.address)}</span></div></li>`);
  return `<ul class="contact-list">${rows.join("")}</ul>`;
}

function hours(d: SiteData) {
  if (!d.hours.length) return "";
  const ui = SITE_UI[d.lang];
  return `<div class="hours"><h4>${icon("clock", 18)} ${esc(ui.hours)}</h4><ul>${d.hours
    .map((h) => {
      const i = h.indexOf(":");
      return i > 0
        ? `<li><span>${esc(h.slice(0, i))}</span><span>${esc(h.slice(i + 1).trim())}</span></li>`
        : `<li><span>${esc(h)}</span></li>`;
    })
    .join("")}</ul></div>`;
}

function ctas(d: SiteData, cls = "") {
  const ui = SITE_UI[d.lang];
  const a: string[] = [];
  if (d.phone) a.push(`<a class="btn btn-main ${cls}" href="${telHref(d)}">${icon("phone", 18)} ${esc(ui.callNow)}</a>`);
  if (d.whatsapp) a.push(`<a class="btn btn-alt ${cls}" href="${waHref(d)}" target="_blank" rel="noopener">${icon("chat", 18)} WhatsApp</a>`);
  return a.join("");
}

function sticky(d: SiteData, o: RenderOptions) {
  if (o.forPdf || !d.phone) return "";
  const ui = SITE_UI[d.lang];
  return `<div class="sticky"><a href="${telHref(d)}" style="background:${d.primary}">${icon("phone", 18, "#fff")} ${esc(ui.callNow)}</a>${
    d.whatsapp ? `<a href="${waHref(d)}" style="background:#1fa855">${icon("chat", 18, "#fff")} WhatsApp</a>` : ""
  }</div>`;
}

function badge(d: SiteData) {
  if (!d.showDemoBadge) return "";
  return `<div class="demo-badge">${esc(SITE_UI[d.lang].demo)}</div>`;
}

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--ease-out:cubic-bezier(.23,1,.32,1);--ease-io:cubic-bezier(.77,0,.175,1)}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{-webkit-font-smoothing:antialiased;line-height:1.55;-webkit-tap-highlight-color:transparent}
h1,h2,h3{text-wrap:balance}p{text-wrap:pretty}
:focus-visible{outline:3px solid currentColor;outline-offset:3px;border-radius:6px}
img{max-width:100%}a{color:inherit;text-decoration:none}ul{list-style:none}
.wrap{max-width:1160px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;gap:10px;padding:15px 24px;border-radius:999px;font-weight:700;font-size:16px;transition:transform 160ms var(--ease-out),filter 200ms ease,background-color 200ms ease;touch-action:manipulation;user-select:none}
.btn:active{transform:scale(.97)}
@media(hover:hover) and (pointer:fine){.btn:hover{filter:brightness(1.06)}}
.mono{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:12px;color:#fff;font-weight:800;font-size:16px;letter-spacing:.5px;flex:none}
.brand{display:flex;align-items:center;gap:12px;min-width:0}
.brand-name{font-weight:800;font-size:18px;letter-spacing:-.01em;line-height:1.15;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.logo-img{height:46px;width:auto;object-fit:contain}
.hero-art{overflow:hidden;aspect-ratio:1/1;width:100%}
.rating{display:inline-flex;align-items:center;gap:6px;font-size:15px}.rating span{opacity:.75}
.contact-list{display:grid;gap:18px}.contact-list li{display:flex;gap:14px;align-items:flex-start}
.contact-list small{display:block;font-size:13px;opacity:.6}
.contact-list a,.contact-list span{font-weight:600;font-size:17px;word-break:break-word}
.hours h4{display:flex;gap:8px;align-items:center;font-size:15px;margin-bottom:10px}
.hours li{display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px dashed rgba(0,0,0,.12);font-size:15px;font-variant-numeric:tabular-nums}
.hours li span:first-child{font-weight:600}.hours li span:first-child::first-letter{text-transform:uppercase}
.map{width:100%;height:320px;border:0;border-radius:20px;display:block}
.map-pdf{display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;font-weight:600;text-align:center;padding:24px}
.sticky{display:none}
.demo-badge{position:fixed;bottom:14px;left:14px;z-index:60;background:rgba(0,0,0,.78);color:#fff;font:600 12px/1 system-ui,sans-serif;padding:8px 12px;border-radius:999px;letter-spacing:.02em}
/* Um único momento de movimento: o topo entra em sequência rápida ao abrir a página */
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.rise{animation:rise 520ms var(--ease-out) both;animation-delay:calc(var(--i,0) * 60ms)}
@keyframes fade{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.rise{animation:fade 200ms ease both;animation-delay:0ms}html{scroll-behavior:auto}}
@media(max-width:760px){
 .sticky{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;gap:8px;padding:10px;background:rgba(255,255,255,.95);box-shadow:0 -6px 24px rgba(0,0,0,.08)}
 .sticky a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;font-weight:700;padding:14px;border-radius:14px;font-size:15px;transition:transform 160ms var(--ease-out)}.sticky a:active{transform:scale(.97)}
 .sticky{padding-bottom:max(10px,env(safe-area-inset-bottom))}
 body{padding-bottom:76px}.demo-badge{bottom:84px}header .btn{display:none}
}`;

function doc(d: SiteData, fonts: string, css: string, body: string) {
  return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(d.name)} — ${esc(d.city)}</title>
<link rel="icon" href="${favicon(d)}"/>
<meta name="description" content="${esc(d.sub)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet"/>
<style>${BASE_CSS}${css}</style></head><body>${body}</body></html>`;
}

/* ---------------- Modelo 1: Clássico ---------------- */
function classic(d: SiteData, o: RenderOptions) {
  const ui = SITE_UI[d.lang];
  const css = `
body{font-family:'Manrope',sans-serif;color:${d.dark};background:#fff}
h1,h2,h3{letter-spacing:-.025em;line-height:1.1}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,.06)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:76px}
nav{display:flex;gap:28px;font-weight:600;font-size:15px}nav a:hover{color:${d.primary}}
.btn-main{background:${d.primary};color:#fff}.btn-alt{background:${d.light};color:${d.dark}}
.hero{padding:72px 0 88px;background:linear-gradient(180deg,${d.light} 0%,#fff 100%)}
.hero .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;color:${d.primary};margin-bottom:18px}
.hero h1{font-size:58px;font-weight:800}.hero p.sub{font-size:20px;opacity:.8;margin:22px 0 32px;max-width:540px}
.hero .actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:26px}
.hero-art{box-shadow:0 30px 60px -20px rgba(0,0,0,.25)}
section{padding:96px 0}.sec-head{max-width:620px;margin-bottom:48px}
.sec-head h2{font-size:42px;font-weight:800}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{border:1px solid rgba(0,0,0,.08);border-radius:22px;padding:28px;background:#fff;transition:.2s}
@media(hover:hover) and (pointer:fine){.card:hover{border-color:${d.primary}}}
.card .ico{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:${d.light};color:${d.primary};margin-bottom:22px}
.card h3{font-size:20px;font-weight:800;margin-bottom:8px}.card p{opacity:.72;font-size:15px}
.why{background:${d.dark};color:#fff}.why .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.why .item{border-top:2px solid ${d.primary};padding-top:22px}.why h3{font-size:22px;margin-bottom:8px}.why p{opacity:.7}
.about .wrap{display:grid;grid-template-columns:1.2fr .8fr;gap:64px}
.about p.text{font-size:19px;opacity:.85}
.hours{background:${d.light};border-radius:22px;padding:28px}
.contact .wrap{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start}
.contact-list li svg{color:${d.primary}}
footer{border-top:1px solid rgba(0,0,0,.08);padding:32px 0;font-size:14px;opacity:.7}
footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
@media(max-width:960px){.grid4{grid-template-columns:repeat(2,1fr)}.hero .wrap,.about .wrap,.contact .wrap{grid-template-columns:1fr}.why .grid3{grid-template-columns:1fr}.hero h1{font-size:42px}nav{display:none}}
@media(max-width:560px){.grid4{grid-template-columns:1fr}.hero h1{font-size:34px}.sec-head h2{font-size:32px}section{padding:64px 0}}`;
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d)}</a>
<nav><a href="#services">${esc(ui.services)}</a><a href="#about">${esc(ui.about)}</a><a href="#contact">${esc(ui.contact)}</a></nav>
${d.phone ? `<a class="btn btn-main" style="padding:11px 18px;font-size:14px" href="${telHref(d)}">${icon("phone", 16)} ${esc(d.phone)}</a>` : ""}</div></header>
<section data-sec="hero" class="hero"><div class="wrap"><div>
<span class="eyebrow">${icon("pin", 16)} ${esc(d.city)}</span>
<h1 class="rise" style="--i:1">${esc(d.headline)}</h1><p class="sub rise" style="--i:2">${esc(d.sub)}</p>
<div class="actions rise" style="--i:3">${ctas(d)}</div>${rating(d, d.dark)}</div>${hero(d, "32px")}</div></section>
<section data-sec="services" id="services"><div class="wrap"><div class="sec-head"><h2>${esc(ui.services)}</h2></div>
<div class="grid4">${d.services.map((s) => `<div class="card"><div class="ico">${icon(d.nicheId, 26)}</div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="why" class="why"><div class="wrap"><div class="sec-head"><h2>${esc(ui.why)}</h2></div>
<div class="grid3">${d.benefits.map((b) => `<div class="item"><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="about" id="about" class="about"><div class="wrap"><div><h2 style="font-size:40px;margin-bottom:20px">${esc(ui.about)}</h2><p class="text">${esc(d.about)}</p></div>${hours(d)}</div></section>
<section data-sec="contact" id="contact" class="contact" style="background:${d.light}"><div class="wrap"><div><h2 style="font-size:40px;margin-bottom:28px">${esc(ui.findUs)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${ctas(d)}</div></div>${map(d, o)}</div></section>
<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(d.name)}. ${esc(ui.rights)}</span><span>${esc(d.city)}</span></div></footer>
${sticky(d, o)}`;
  return doc(d, "family=Manrope:wght@400;600;700;800", css, body);
}

/* ---------------- Modelo 2: Impacto ---------------- */
function bold(d: SiteData, o: RenderOptions) {
  const ui = SITE_UI[d.lang];
  const css = `
body{font-family:'Inter Tight',sans-serif;background:${d.dark};color:#fff}
h1,h2,h3{font-family:'Archivo',sans-serif;letter-spacing:-.03em;line-height:.98;text-transform:uppercase}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:84px}
.btn-main{background:${d.primary};color:#fff}.btn-alt{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.35)}
.hero{padding:40px 0 80px;position:relative;overflow:hidden}
.hero h1{font-size:92px;font-weight:900;max-width:980px}
.hero h1 em{font-style:normal;color:${d.primary}}
.hero .row{display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:end;margin-top:40px}
.hero p.sub{font-size:21px;opacity:.75;max-width:560px;margin-bottom:30px}
.hero .actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.hero-art{aspect-ratio:4/5}
.marquee{background:${d.primary};color:#fff;padding:18px 0;overflow:hidden;white-space:nowrap;font-family:'Archivo';font-weight:900;font-size:22px;text-transform:uppercase}
.marquee span{margin:0 28px}
section{padding:110px 0}
.sec-title{font-size:64px;font-weight:900;margin-bottom:56px}
.list{border-top:1px solid rgba(255,255,255,.15)}
.list li{display:grid;grid-template-columns:90px 1fr 1.2fr;gap:24px;padding:34px 0;border-bottom:1px solid rgba(255,255,255,.15);align-items:baseline}
.list .n{color:${d.primary};display:flex}
.list h3{font-size:30px;font-weight:900}.list p{opacity:.7;font-size:17px}
.light{background:#fff;color:${d.dark}}
.light .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.light .item{background:${d.light};border-radius:24px;padding:34px}
.light .item .ico{width:46px;height:46px;border-radius:50%;background:${d.primary};display:grid;place-items:center;color:#fff;margin-bottom:24px}
.light .item h3{font-size:24px;margin-bottom:10px}
.about .wrap{display:grid;grid-template-columns:1.3fr .7fr;gap:64px}
.about p.text{font-size:24px;line-height:1.45;opacity:.85}
.hours{border:1px solid rgba(255,255,255,.18);border-radius:22px;padding:28px}.hours li{border-color:rgba(255,255,255,.15)}
.contact .wrap{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.contact-list li svg{color:${d.primary}}
footer{border-top:1px solid rgba(255,255,255,.12);padding:30px 0;font-size:14px;opacity:.6}
@media(max-width:960px){.hero h1{font-size:58px}.hero .row,.about .wrap,.contact .wrap{grid-template-columns:1fr}.light .grid3{grid-template-columns:1fr}.sec-title{font-size:44px}.list li{grid-template-columns:50px 1fr}.list p{grid-column:2}}
@media(max-width:560px){.hero h1{font-size:42px}section{padding:72px 0}.list h3{font-size:24px}}`;
  const h1 = esc(d.headline);
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d, true)}</a>${d.phone ? `<a class="btn btn-main" style="padding:12px 20px;font-size:14px" href="${telHref(d)}">${icon("phone", 16)} ${esc(d.phone)}</a>` : ""}</div></header>
<section data-sec="hero" class="hero"><div class="wrap"><h1 class="rise" style="--i:1">${h1}</h1>
<div class="row"><div><p class="sub rise" style="--i:2">${esc(d.sub)}</p><div class="actions rise" style="--i:3">${ctas(d)}</div>${rating(d, "#fff")}</div>${hero(d, "28px")}</div></div></section>
<div class="marquee">${Array.from({ length: 3 }).map(() => d.services.map((s) => `<span>${esc(s.title)}</span><span>✦</span>`).join("")).join("")}</div>
<section data-sec="services" id="services"><div class="wrap"><h2 class="sec-title">${esc(ui.services)}</h2>
<ul class="list">${d.services.map((s) => `<li><span class="n">${icon(d.nicheId, 28)}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join("")}</ul></div></section>
<section data-sec="why" class="light"><div class="wrap"><h2 class="sec-title">${esc(ui.why)}</h2>
<div class="grid3">${d.benefits.map((b) => `<div class="item"><div class="ico">${icon("check", 22, "#fff", 3)}</div><h3>${esc(b.title)}</h3><p style="opacity:.75">${esc(b.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="about" class="about"><div class="wrap"><div><h2 class="sec-title" style="margin-bottom:28px">${esc(ui.about)}</h2><p class="text">${esc(d.about)}</p></div>${hours(d)}</div></section>
<section data-sec="contact" class="contact" style="padding-top:0"><div class="wrap"><div><h2 class="sec-title" style="margin-bottom:32px">${esc(ui.contact)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:32px">${ctas(d)}</div></div>${map(d, o)}</div></section>
<footer><div class="wrap">© ${new Date().getFullYear()} ${esc(d.name)} · ${esc(d.city)}. ${esc(ui.rights)}</div></footer>
${sticky(d, o)}`;
  return doc(d, "family=Archivo:wght@800;900&family=Inter+Tight:wght@400;500;700", css, body);
}

/* ---------------- Modelo 3: Acolhedor ---------------- */
function soft(d: SiteData, o: RenderOptions) {
  const ui = SITE_UI[d.lang];
  const css = `
body{font-family:'DM Sans',sans-serif;background:${d.light};color:${d.dark}}
h1,h2,h3{font-family:'Fraunces',serif;font-weight:600;letter-spacing:-.02em;line-height:1.08}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:84px}
nav{display:flex;gap:26px;font-size:15px;font-weight:500}
.btn-main{background:${d.dark};color:#fff}.btn-alt{background:#fff;color:${d.dark}}
.hero{text-align:center;padding:56px 0 40px}
.hero h1{font-size:68px;max-width:880px;margin:0 auto}
.hero h1 i{color:${d.primary}}
.hero p.sub{font-size:20px;opacity:.75;max-width:600px;margin:22px auto 32px}
.hero .actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.hero .frame{max-width:980px;margin:56px auto 0}
.hero-art{aspect-ratio:16/8}
section{padding:96px 0}
.sec-head{text-align:center;max-width:640px;margin:0 auto 52px}.sec-head h2{font-size:48px}
.sec-head .k{font-size:14px;font-weight:700;color:${d.primary};letter-spacing:.14em;text-transform:uppercase;display:block;margin-bottom:12px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.svc{background:#fff;border-radius:28px;padding:30px;display:flex;gap:20px;align-items:flex-start}
.svc .ico{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:${d.light};color:${d.primary}}
.svc h3{font-size:24px;margin-bottom:6px}.svc p{opacity:.72}
.white{background:#fff}
.benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.benefits div{text-align:center;padding:24px}
.benefits .ico{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:${d.primary};display:grid;place-items:center;color:#fff}
.benefits h3{font-size:24px;margin-bottom:8px}.benefits p{opacity:.72}
.about .wrap{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.about blockquote{font-family:'Fraunces',serif;font-size:30px;line-height:1.35}
.hours{background:#fff;border-radius:28px;padding:30px}
.contact .box{background:${d.dark};color:#fff;border-radius:36px;padding:56px;display:grid;grid-template-columns:1fr 1fr;gap:48px}
.contact .box h2{font-size:44px;margin-bottom:28px}
.contact .btn-main{background:${d.primary}}
footer{padding:36px 0;text-align:center;font-size:14px;opacity:.6}
@media(max-width:960px){.hero h1{font-size:46px}.grid2,.benefits,.about .wrap,.contact .box{grid-template-columns:1fr}nav{display:none}.contact .box{padding:32px}.hero-art{aspect-ratio:4/3}}
@media(max-width:560px){.hero h1{font-size:36px}.sec-head h2{font-size:34px}section{padding:64px 0}}`;
  const h1 = esc(d.headline);
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d)}</a><nav><a href="#services">${esc(ui.services)}</a><a href="#about">${esc(ui.about)}</a><a href="#contact">${esc(ui.contact)}</a></nav></div></header>
<section data-sec="hero" class="hero" style="padding-bottom:40px"><div class="wrap"><h1 class="rise" style="--i:1">${h1}</h1><p class="sub rise" style="--i:2">${esc(d.sub)}</p><div class="actions rise" style="--i:3">${ctas(d)}</div>${rating(d, d.dark)}
<div class="frame">${hero(d, "36px", "meet")}</div></div></section>
<section data-sec="services" id="services"><div class="wrap"><div class="sec-head"><h2>${esc(ui.services)}</h2></div>
<div class="grid2">${d.services.map((s) => `<div class="svc"><div class="ico">${icon(d.nicheId, 26)}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></div>`).join("")}</div></div></section>
<section data-sec="why" class="white"><div class="wrap"><div class="sec-head"><h2>${esc(ui.why)}</h2></div>
<div class="benefits">${d.benefits.map((b) => `<div><div class="ico">${icon("check", 26, "#fff", 2.5)}</div><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="about" id="about" class="about"><div class="wrap"><div><h2 style="font-size:40px">${esc(ui.about)}</h2><blockquote style="margin-top:16px">${esc(d.about)}</blockquote></div>${hours(d) || map(d, o)}</div></section>
<section data-sec="contact" id="contact" class="contact" style="padding-top:0"><div class="wrap"><div class="box"><div><h2>${esc(ui.contact)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${ctas(d)}</div></div>${d.hours.length ? map(d, o) : ""}</div></div></section>
<footer>© ${new Date().getFullYear()} ${esc(d.name)} · ${esc(ui.rights)}</footer>
${sticky(d, o)}`;
  return doc(d, "family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=DM+Sans:wght@400;500;700", css, body);
}

/* ---------------- Modelo 4: Vitrine ----------------
   Ideia: a fachada de uma loja de bairro. O nome é o letreiro, o toldo listrado
   leva a cor da marca. Todo o resto fica quieto para o letreiro aparecer. */
function storefront(d: SiteData, o: RenderOptions) {
  const ui = SITE_UI[d.lang];
  const len = d.name.length;
  const signSize = len <= 12 ? "clamp(56px,11vw,148px)" : len <= 22 ? "clamp(44px,8vw,110px)" : "clamp(34px,5.6vw,78px)";
  const css = `
body{font-family:'Instrument Sans',sans-serif;color:${d.dark};background:#fff}
h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.025em;line-height:1.02}
.awning{height:34px;background:repeating-linear-gradient(90deg,${d.primary} 0 44px,${d.light} 44px 88px);-webkit-mask:radial-gradient(22px 11px at 22px 100%,#0000 97%,#000) 0 0/44px 100%;mask:radial-gradient(22px 11px at 22px 100%,#0000 97%,#000) 0 0/44px 100%}
.topbar .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:18px;padding-bottom:6px;font-size:15px}
.topbar .where{display:flex;align-items:center;gap:8px;opacity:.75}
.btn-main{background:${d.dark};color:#fff}.btn-alt{background:${d.light};color:${d.dark}}
.sign{font-size:${signSize};font-weight:800;line-height:.9;letter-spacing:-.045em;overflow-wrap:anywhere;padding:18px 0 22px;border-bottom:6px solid ${d.primary}}
.sign .logo-img{height:.8em;vertical-align:-.08em;margin-right:.15em}
.intro{display:grid;grid-template-columns:1.35fr .9fr;gap:56px;padding:44px 0 40px;align-items:start}
.intro .lede{font-family:'Bricolage Grotesque',sans-serif;font-size:34px;font-weight:600;line-height:1.12;letter-spacing:-.02em;max-width:20ch}
.intro p.sub{font-size:19px;opacity:.78;margin:18px 0 28px;max-width:52ch}
.intro .actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:22px}
.card-hours{border:2px solid ${d.dark};border-radius:22px;padding:24px 26px;background:#fff}
.card-hours .hours h4{font-family:'Bricolage Grotesque';font-size:20px;margin-bottom:12px}
.window{padding-bottom:24px}.window .hero-art{aspect-ratio:21/8;border-radius:28px}
section.block{padding:84px 0}
.sh{font-size:44px;font-weight:800;margin-bottom:34px}
.svc{display:grid;grid-template-columns:1fr 1fr;column-gap:56px}
.svc li{display:grid;grid-template-columns:52px 1fr;gap:18px;padding:24px 0;border-top:1px solid rgba(0,0,0,.1)}
.svc .ico{width:52px;height:52px;border-radius:50%;background:${d.light};color:${d.primary};display:grid;place-items:center}
.svc h3{font-size:22px;margin-bottom:4px}.svc p{opacity:.72;max-width:44ch}
.why{background:${d.light}}
.why ul{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.why h3{font-size:26px;margin-bottom:8px}.why p{opacity:.75}
.about .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.about p.text{font-size:22px;line-height:1.5;max-width:40ch}
.contact .panel{background:${d.dark};color:#fff;border-radius:32px;padding:52px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.contact .panel h2{font-size:44px;margin-bottom:28px;color:#fff}
.contact .btn-main{background:${d.primary}}.contact .btn-alt{background:#fff;color:${d.dark}}
.contact-list li svg{color:${d.primary}}
footer{padding:36px 0 44px;font-size:14px;opacity:.65}
footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
@media(max-width:960px){.intro,.about .wrap,.contact .panel{grid-template-columns:1fr}.svc{grid-template-columns:1fr}.why ul{grid-template-columns:1fr}.window .hero-art{aspect-ratio:4/3}.intro .lede{font-size:28px}}
@media(max-width:560px){.sh,.contact .panel h2{font-size:34px}section.block{padding:60px 0}.contact .panel{padding:30px;border-radius:24px}}`;
  const signLogo = d.logo ? `<img class="logo-img" src="${d.logo}" alt=""/>` : "";
  const body = `${badge(d)}
<div class="awning" aria-hidden="true"></div>
<div class="topbar"><div class="wrap"><span class="where">${icon("pin", 16)} ${esc(d.city)}</span>${d.phone ? `<a class="btn btn-main" style="padding:11px 18px;font-size:14px" href="${telHref(d)}">${icon("phone", 16)} ${esc(d.phone)}</a>` : ""}</div></div>
<section data-sec="hero" class="hero"><div class="wrap">
<h1 class="sign rise" style="--i:0">${signLogo}${esc(d.name)}</h1>
<div class="intro"><div><p class="lede rise" style="--i:1">${esc(d.headline)}</p><p class="sub rise" style="--i:2">${esc(d.sub)}</p><div class="actions rise" style="--i:3">${ctas(d)}</div>${rating(d, d.dark)}</div>
<div class="card-hours rise" style="--i:3">${hours(d) || contactList(d, d.primary)}</div></div>
<div class="window">${hero(d, "28px", d.heroImage ? "slice" : "meet")}</div>
</div></section>
<section data-sec="services" id="services" class="block"><div class="wrap"><h2 class="sh">${esc(ui.services)}</h2>
<ul class="svc">${d.services.map((s) => `<li><span class="ico">${icon(d.nicheId, 24)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></li>`).join("")}</ul></div></section>
<section data-sec="why" class="block why"><div class="wrap"><h2 class="sh">${esc(ui.why)}</h2>
<ul>${d.benefits.map((b) => `<li><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></li>`).join("")}</ul></div></section>
<section data-sec="about" id="about" class="block about"><div class="wrap"><div><h2 class="sh">${esc(ui.about)}</h2><p class="text">${esc(d.about)}</p></div>${map(d, o)}</div></section>
<section data-sec="contact" id="contact" class="block contact" style="padding-top:0"><div class="wrap"><div class="panel"><div><h2>${esc(ui.contact)}</h2>${contactList(d, d.primary)}</div><div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">${ctas(d)}</div></div></div></section>
<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(d.name)}. ${esc(ui.rights)}</span><span>${esc(d.address)}</span></div></footer>
${sticky(d, o)}`;
  return doc(d, "family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Instrument+Sans:wght@400;500;600", css, body);
}

/* ---------------- Modelo 5: Atendimento ----------------
   Ideia: quem procura um encanador ou uma clínica quer falar com alguém já.
   A peça central é um cartão de contato com picote, com o telefone em destaque. */
function service(d: SiteData, o: RenderOptions) {
  const ui = SITE_UI[d.lang];
  const heroBg = "#ffffff";
  const css = `
body{font-family:'Schibsted Grotesk',sans-serif;color:${d.dark};background:#fff}
h1,h2,h3{letter-spacing:-.025em;line-height:1.06}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:78px}
.btn-main{background:${d.primary};color:#fff}.btn-alt{background:${d.light};color:${d.dark}}
.hero{background:${heroBg};padding:36px 0 72px}
.hero .wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:start}
.hero h1{font-size:56px;font-weight:800;max-width:15ch}
.hero p.sub{font-size:19px;opacity:.78;margin:20px 0 26px;max-width:46ch}
.checks{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin:4px 0 26px}
.checks li{display:flex;gap:10px;align-items:flex-start;font-weight:600}
.checks svg{flex:none;color:${d.primary};margin-top:2px}
.ticket{position:relative;background:#fff;border-radius:26px;box-shadow:0 1px 2px rgba(0,0,0,.05),0 28px 60px -28px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.06);overflow:visible}
.ticket .top{padding:30px 30px 26px}
.ticket .label{font-size:15px;opacity:.65}
.ticket .tel{display:block;font-size:38px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;margin:6px 0 20px;color:${d.dark};overflow-wrap:anywhere}
.ticket .ctas{display:flex;flex-direction:column;gap:10px}.ticket .ctas .btn{justify-content:center}
.ticket .cut{position:relative;height:28px}
.ticket .cut::before{content:"";position:absolute;left:24px;right:24px;top:50%;border-top:2px dashed rgba(0,0,0,.14)}
.ticket .cut::after,.ticket .cut i{content:"";position:absolute;top:0;width:28px;height:28px;border-radius:50%;background:${heroBg};box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
.ticket .cut::after{right:-14px}.ticket .cut i{left:-14px}
.ticket .bottom{padding:12px 30px 28px}
.ticket .bottom .hours li{padding:5px 0;font-size:14px}
.ticket .addr{display:flex;gap:10px;font-size:15px;margin-bottom:12px;opacity:.85}
section.block{padding:84px 0}
.sh{font-size:42px;font-weight:800;margin-bottom:12px}
.lead{font-size:18px;opacity:.72;max-width:52ch;margin-bottom:36px}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:0 48px}
.svc li{display:flex;gap:16px;padding:22px 0;border-bottom:1px solid rgba(0,0,0,.09)}
.svc svg{flex:none;color:${d.primary};margin-top:3px}
.svc h3{font-size:20px;margin-bottom:4px}.svc p{opacity:.72}
.why{background:${d.dark};color:#fff}
.why ul{display:grid;grid-template-columns:repeat(3,1fr)}
.why li{padding:6px 32px;border-left:1px solid rgba(255,255,255,.18)}.why li:first-child{padding-left:0;border-left:0}
.why h3{font-size:24px;margin-bottom:8px;color:#fff}.why p{opacity:.72}
.about .wrap{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:center}
.about .hero-art{aspect-ratio:4/3;border-radius:26px}
.about p.text{font-size:20px;line-height:1.6;max-width:46ch}
.contact .wrap{display:grid;grid-template-columns:1fr 1.1fr;gap:56px;align-items:start}
.contact-list li svg{color:${d.primary}}
footer{border-top:1px solid rgba(0,0,0,.08);padding:30px 0;font-size:14px;opacity:.7}
@media(max-width:960px){.hero .wrap,.about .wrap,.contact .wrap{grid-template-columns:1fr}.hero h1{font-size:40px}.svc{grid-template-columns:1fr}.why ul{grid-template-columns:1fr;gap:24px}.why li{padding:0 0 0 18px;border-left:2px solid ${d.primary}}.why li:first-child{padding-left:18px;border-left:2px solid ${d.primary}}.ticket .cut::after,.ticket .cut i{background:${heroBg}}}
@media(max-width:560px){header .rating{display:none}.hero h1{font-size:34px}.checks{grid-template-columns:1fr}.sh{font-size:32px}section.block{padding:60px 0}.ticket .tel{font-size:30px}}`;
  const ticket = `<aside class="ticket rise" style="--i:3" aria-label="${esc(ui.contact)}">
<div class="top"><span class="label">${esc(ui.callNow)}</span>${d.phone ? `<a class="tel" href="${telHref(d)}">${esc(d.phone)}</a>` : `<span class="tel">${esc(d.name)}</span>`}<div class="ctas">${ctas(d)}</div></div>
<div class="cut"><i></i></div>
<div class="bottom">${d.address ? `<p class="addr">${icon("pin", 18, d.primary)}<span>${esc(d.address)}</span></p>` : ""}${hours(d)}</div></aside>`;
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d)}</a>${rating(d, d.dark)}</div></header>
<section data-sec="hero" class="hero"><div class="wrap"><div>
<h1 class="rise" style="--i:1">${esc(d.headline)}</h1><p class="sub rise" style="--i:2">${esc(d.sub)}</p>
<ul class="checks rise" style="--i:3">${d.services.slice(0, 4).map((s) => `<li>${icon("check", 20, d.primary, 3)}<span>${esc(s.title)}</span></li>`).join("")}</ul>
</div>${ticket}</div></section>
<section data-sec="services" id="services" class="block"><div class="wrap"><h2 class="sh" style="margin-bottom:28px">${esc(ui.services)}</h2>
<ul class="svc">${d.services.map((s) => `<li>${icon("check", 22, d.primary, 3)}<div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></li>`).join("")}</ul></div></section>
<section data-sec="why" class="block why"><div class="wrap"><h2 class="sh" style="margin-bottom:36px">${esc(ui.why)}</h2>
<ul>${d.benefits.map((b) => `<li><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></li>`).join("")}</ul></div></section>
<section data-sec="about" id="about" class="block about"><div class="wrap">${hero(d, "26px")}<div><h2 class="sh" style="margin-bottom:18px">${esc(ui.about)}</h2><p class="text">${esc(d.about)}</p></div></div></section>
<section data-sec="contact" id="contact" class="block contact" style="background:${d.light}"><div class="wrap"><div><h2 class="sh" style="margin-bottom:28px">${esc(ui.findUs)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${ctas(d)}</div></div>${map(d, o)}</div></section>
<footer><div class="wrap">© ${new Date().getFullYear()} ${esc(d.name)} · ${esc(d.city)}. ${esc(ui.rights)}</div></footer>
${sticky(d, o)}`;
  return doc(d, "family=Schibsted+Grotesk:wght@400;500;600;700;800", css, body);
}

const NO_MOTION = "<style>.rise{animation:none!important}*{transition:none!important}</style>";

export function renderSite(d: SiteData, o: RenderOptions = {}) {
  const html =
    d.template === "bold" ? bold(d, o)
    : d.template === "soft" ? soft(d, o)
    : d.template === "storefront" ? storefront(d, o)
    : d.template === "service" ? service(d, o)
    : classic(d, o);
  const out = applyBlocks(html, d);
  // PDF e miniaturas: sem animação, para a captura sair completa
  return o.forPdf ? out.replace("</head>", NO_MOTION + "</head>") : out;
}
