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

function logo(d: SiteData, onDark = false) {
  if (d.logo) return `<img class="logo-img" src="${d.logo}" alt="${esc(d.name)}"/>`;
  return `<span class="mono" style="background:${d.primary}">${esc(initials(d.name))}</span><span class="brand-name" style="color:${onDark ? "#fff" : d.dark}">${esc(d.name)}</span>`;
}

function hero(d: SiteData, radius: string, fit: "slice" | "meet" = "slice") {
  const inner = d.heroImage
    ? `<img src="${d.heroImage}" alt="${esc(d.name)}" style="width:100%;height:100%;object-fit:cover;display:block"/>`
    : heroArt(d.nicheId, d.primary, d.dark, d.light).replace("xMidYMid slice", `xMidYMid ${fit}`);
  return `<div class="hero-art" style="border-radius:${radius};background:${d.light}">${inner}</div>`;
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
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{-webkit-font-smoothing:antialiased;line-height:1.55}
img{max-width:100%}a{color:inherit;text-decoration:none}ul{list-style:none}
.wrap{max-width:1160px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;gap:10px;padding:15px 24px;border-radius:999px;font-weight:700;font-size:16px;transition:transform .15s}
.btn:hover{transform:translateY(-2px)}
.mono{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:12px;color:#fff;font-weight:800;font-size:16px;letter-spacing:.5px;flex:none}
.brand{display:flex;align-items:center;gap:12px}.brand-name{font-weight:800;font-size:18px;letter-spacing:-.01em}
.logo-img{height:46px;width:auto;object-fit:contain}
.hero-art{overflow:hidden;aspect-ratio:1/1;width:100%}
.rating{display:inline-flex;align-items:center;gap:6px;font-size:15px}.rating span{opacity:.75}
.contact-list{display:grid;gap:18px}.contact-list li{display:flex;gap:14px;align-items:flex-start}
.contact-list small{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.6}
.contact-list a,.contact-list span{font-weight:600;font-size:17px;word-break:break-word}
.hours h4{display:flex;gap:8px;align-items:center;font-size:15px;margin-bottom:10px}
.hours li{display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px dashed rgba(0,0,0,.12);font-size:15px}
.hours li span:first-child{font-weight:600}.hours li span:first-child::first-letter{text-transform:uppercase}
.map{width:100%;height:320px;border:0;border-radius:20px;display:block}
.map-pdf{display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;font-weight:600;text-align:center;padding:24px}
.sticky{display:none}
.demo-badge{position:fixed;bottom:14px;left:14px;z-index:60;background:rgba(0,0,0,.78);color:#fff;font:600 12px/1 system-ui,sans-serif;padding:8px 12px;border-radius:999px;letter-spacing:.04em}
@media(max-width:760px){
 .sticky{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;gap:8px;padding:10px;background:rgba(255,255,255,.95);box-shadow:0 -6px 24px rgba(0,0,0,.08)}
 .sticky a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;font-weight:700;padding:14px;border-radius:14px;font-size:15px}
 body{padding-bottom:76px}.demo-badge{bottom:84px}header .btn{display:none}
}`;

function doc(d: SiteData, fonts: string, css: string, body: string) {
  return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(d.name)} — ${esc(d.city)}</title>
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
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:${d.primary};margin-bottom:18px}
.hero h1{font-size:58px;font-weight:800}.hero p.sub{font-size:20px;opacity:.8;margin:22px 0 32px;max-width:540px}
.hero .actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:26px}
.hero-art{box-shadow:0 30px 60px -20px rgba(0,0,0,.25)}
section{padding:96px 0}.sec-head{max-width:620px;margin-bottom:48px}
.sec-head h2{font-size:42px;font-weight:800}.kicker{color:${d.primary};font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px;display:block}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{border:1px solid rgba(0,0,0,.08);border-radius:22px;padding:28px;background:#fff;transition:.2s}
.card:hover{border-color:${d.primary};transform:translateY(-4px)}
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
<h1>${esc(d.headline)}</h1><p class="sub">${esc(d.sub)}</p>
<div class="actions">${ctas(d)}</div>${rating(d, d.dark)}</div>${hero(d, "32px")}</div></section>
<section data-sec="services" id="services"><div class="wrap"><div class="sec-head"><span class="kicker">${esc(d.name)}</span><h2>${esc(ui.services)}</h2></div>
<div class="grid4">${d.services.map((s) => `<div class="card"><div class="ico">${icon(d.nicheId, 26)}</div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="why" class="why"><div class="wrap"><div class="sec-head"><span class="kicker">${esc(d.name)}</span><h2>${esc(ui.why)}</h2></div>
<div class="grid3">${d.benefits.map((b) => `<div class="item"><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="about" id="about" class="about"><div class="wrap"><div><span class="kicker">${esc(ui.about)}</span><h2 style="font-size:40px;margin-bottom:20px">${esc(d.name)}</h2><p class="text">${esc(d.about)}</p></div>${hours(d)}</div></section>
<section data-sec="contact" id="contact" class="contact" style="background:${d.light}"><div class="wrap"><div><span class="kicker">${esc(ui.contact)}</span><h2 style="font-size:40px;margin-bottom:28px">${esc(ui.findUs)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${ctas(d)}</div></div>${map(d, o)}</div></section>
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
.list .n{font-family:'Archivo';font-weight:900;font-size:22px;color:${d.primary}}
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
  const words = d.headline.split(" ");
  const h1 = words.length > 2 ? `${esc(words.slice(0, -2).join(" "))} <em>${esc(words.slice(-2).join(" "))}</em>` : esc(d.headline);
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d, true)}</a>${d.phone ? `<a class="btn btn-main" style="padding:12px 20px;font-size:14px" href="${telHref(d)}">${icon("phone", 16)} ${esc(d.phone)}</a>` : ""}</div></header>
<section data-sec="hero" class="hero"><div class="wrap"><h1>${h1}</h1>
<div class="row"><div><p class="sub">${esc(d.sub)}</p><div class="actions">${ctas(d)}</div>${rating(d, "#fff")}</div>${hero(d, "28px")}</div></div></section>
<div class="marquee">${Array.from({ length: 3 }).map(() => d.services.map((s) => `<span>${esc(s.title)}</span><span>✦</span>`).join("")).join("")}</div>
<section data-sec="services" id="services"><div class="wrap"><h2 class="sec-title">${esc(ui.services)}</h2>
<ul class="list">${d.services.map((s, i) => `<li><span class="n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join("")}</ul></div></section>
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
  const words = d.headline.split(" ");
  const h1 = words.length > 3 ? `${esc(words.slice(0, -1).join(" "))} <i>${esc(words.slice(-1)[0])}</i>` : esc(d.headline);
  const body = `${badge(d)}
<header><div class="wrap"><a href="#" class="brand">${logo(d)}</a><nav><a href="#services">${esc(ui.services)}</a><a href="#about">${esc(ui.about)}</a><a href="#contact">${esc(ui.contact)}</a></nav></div></header>
<section data-sec="hero" class="hero" style="padding-bottom:40px"><div class="wrap"><h1>${h1}</h1><p class="sub">${esc(d.sub)}</p><div class="actions">${ctas(d)}</div>${rating(d, d.dark)}
<div class="frame">${hero(d, "36px", "meet")}</div></div></section>
<section data-sec="services" id="services"><div class="wrap"><div class="sec-head"><span class="k">${esc(d.name)}</span><h2>${esc(ui.services)}</h2></div>
<div class="grid2">${d.services.map((s) => `<div class="svc"><div class="ico">${icon(d.nicheId, 26)}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></div>`).join("")}</div></div></section>
<section data-sec="why" class="white"><div class="wrap"><div class="sec-head"><span class="k">${esc(d.name)}</span><h2>${esc(ui.why)}</h2></div>
<div class="benefits">${d.benefits.map((b) => `<div><div class="ico">${icon("check", 26, "#fff", 2.5)}</div><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></div>`).join("")}</div></div></section>
<section data-sec="about" id="about" class="about"><div class="wrap"><div><span class="k" style="color:${d.primary};font-weight:700;letter-spacing:.14em;font-size:14px;text-transform:uppercase">${esc(ui.about)}</span><blockquote style="margin-top:16px">${esc(d.about)}</blockquote></div>${hours(d) || map(d, o)}</div></section>
<section data-sec="contact" id="contact" class="contact" style="padding-top:0"><div class="wrap"><div class="box"><div><h2>${esc(ui.contact)}</h2>${contactList(d, d.primary)}<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${ctas(d)}</div></div>${d.hours.length ? map(d, o) : ""}</div></div></section>
<footer>© ${new Date().getFullYear()} ${esc(d.name)} · ${esc(ui.rights)}</footer>
${sticky(d, o)}`;
  return doc(d, "family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=DM+Sans:wght@400;500;700", css, body);
}

export function renderSite(d: SiteData, o: RenderOptions = {}) {
  const html = d.template === "bold" ? bold(d, o) : d.template === "soft" ? soft(d, o) : classic(d, o);
  return applyBlocks(html, d);
}
