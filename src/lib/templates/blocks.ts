import { SITE_UI } from "../data/locales";
import { icon } from "./icons";
import { sanitizeHtml } from "./sanitize";
import type { Block, BlockPosition, SiteData } from "./types";

const esc = (s: string | number | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const digits = (s: string) => s.replace(/[^\d+]/g, "");

/** CSS das seções extras. Usa variáveis definidas no estilo da própria seção. */
export const BLOCKS_CSS = `
.xb{padding:88px 0}
.xb .xh{max-width:680px;margin-bottom:40px}
.xb .xh h2{font-size:40px;margin-bottom:12px}
.xb .xh p{font-size:18px;opacity:.78}
.xb .xg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.xb .xc{background:var(--card);border:1px solid var(--bd);border-radius:22px;padding:26px}
.xb .xc h3{font-size:20px;margin-bottom:8px}
.xb .xc p{opacity:.75;font-size:15px}
.xb .xn{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--p);color:#fff;font-weight:800;margin-bottom:16px}
.xb .xprice{font-size:32px;font-weight:800;color:var(--p);margin:6px 0 10px}
.xb .xfaq{display:grid;gap:12px;max-width:860px}
.xb .xfaq .xc h3{font-size:18px}
.xb .xtext{max-width:780px;font-size:18px;line-height:1.7;opacity:.88}
.xb .xtext p+p{margin-top:16px}
.xcta{padding:72px 0}
.xcta .box{background:var(--p);color:#fff;border-radius:28px;padding:48px;display:flex;flex-wrap:wrap;gap:28px;align-items:center;justify-content:space-between}
.xcta h2{font-size:34px;color:#fff;margin-bottom:8px}.xcta p{opacity:.9;font-size:17px;max-width:620px}
.xcta a{display:inline-flex;align-items:center;gap:10px;background:#fff;color:var(--d);padding:15px 24px;border-radius:999px;font-weight:700}
.xcustom{max-width:100%;overflow-wrap:anywhere}
.xcustom img{max-width:100%;height:auto;border-radius:16px}
@media(max-width:760px){.xb{padding:60px 0}.xb .xh h2,.xcta h2{font-size:30px}.xcta .box{padding:30px}}
`;

function blockHtml(d: SiteData, b: Block): string {
  const items = (b.items ?? []).slice(0, 12);
  const head = b.title || b.text
    ? `<div class="xh">${b.title ? `<h2>${esc(b.title)}</h2>` : ""}${b.text && b.type !== "text" ? `<p>${esc(b.text)}</p>` : ""}</div>`
    : "";

  switch (b.type) {
    case "cta": {
      const ui = SITE_UI[d.lang];
      const href = d.phone ? `tel:${digits(d.intlPhone || d.phone)}` : d.whatsapp ? `https://wa.me/${d.whatsapp}` : "#contact";
      return `<section class="xcta" data-block="${esc(b.id)}"><div class="wrap"><div class="box"><div>${b.title ? `<h2>${esc(b.title)}</h2>` : ""}${b.text ? `<p>${esc(b.text)}</p>` : ""}</div><a href="${href}">${icon("phone", 18)} ${esc(b.button || ui.callNow)}</a></div></div></section>`;
    }
    case "text":
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${b.title ? `<div class="xh"><h2>${esc(b.title)}</h2></div>` : ""}<div class="xtext">${String(b.text ?? "")
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p).replace(/\n/g, "<br/>")}</p>`)
        .join("")}</div></div></section>`;
    case "faq":
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${head}<div class="xfaq">${items
        .map((it) => `<div class="xc"><h3>${esc(it.title)}</h3>${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</div>`)
        .join("")}</div></div></section>`;
    case "steps":
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${head}<div class="xg">${items
        .map((it, i) => `<div class="xc"><span class="xn">${i + 1}</span><h3>${esc(it.title)}</h3>${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</div>`)
        .join("")}</div></div></section>`;
    case "pricing":
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${head}<div class="xg">${items
        .map((it) => `<div class="xc"><h3>${esc(it.title)}</h3>${it.price ? `<div class="xprice">${esc(it.price)}</div>` : ""}${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</div>`)
        .join("")}</div></div></section>`;
    case "custom":
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${b.title ? `<div class="xh"><h2>${esc(b.title)}</h2></div>` : ""}<div class="xcustom">${sanitizeHtml(b.html ?? "")}</div></div></section>`;
    case "list":
    default:
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${head}<div class="xg">${items
        .map((it) => `<div class="xc"><h3>${esc(it.title)}</h3>${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</div>`)
        .join("")}</div></div></section>`;
  }
}

/** Cores dos cartões conforme o modelo (o "Impacto" é escuro) */
function themeVars(d: SiteData) {
  const darkTheme = d.template === "bold";
  const card = darkTheme ? "rgba(255,255,255,.06)" : d.template === "soft" ? "#fff" : d.light;
  const bd = darkTheme ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.07)";
  return `--p:${d.primary};--d:${d.dark};--l:${d.light};--card:${card};--bd:${bd}`;
}

/**
 * Insere as seções extras nas posições pedidas e remove as seções fixas escondidas.
 * Os modelos marcam suas seções com data-sec="hero|services|why|about|contact".
 */
export function applyBlocks(html: string, d: SiteData): string {
  const blocks = d.blocks ?? [];
  const hidden = d.hidden ?? {};
  let out = html;

  if (blocks.length) {
    const vars = themeVars(d);
    const render = (pos: BlockPosition) =>
      blocks
        .filter((b) => b.position === pos)
        .map((b) => blockHtml(d, b).replace(/^<section /, `<section style="${vars}" `))
        .join("");

    const sec = (name: string) => new RegExp(`<section\\b[^>]*data-sec="${name}"[^>]*>[\\s\\S]*?</section>`);
    const insertAfter = (name: string, extra: string, fallback: string) => {
      if (!extra) return;
      const m = out.match(sec(name));
      if (m && m.index !== undefined) out = out.slice(0, m.index + m[0].length) + extra + out.slice(m.index + m[0].length);
      else out = out.replace(fallback, extra + fallback);
    };

    insertAfter("hero", render("after-hero"), "<footer");
    insertAfter("services", render("after-services"), "<footer");
    insertAfter("about", render("after-about"), "<footer");
    const beforeContact = render("before-contact");
    if (beforeContact) {
      const m = out.match(sec("contact"));
      out = m && m.index !== undefined ? out.slice(0, m.index) + beforeContact + out.slice(m.index) : out.replace("<footer", beforeContact + "<footer");
    }
    out = out.replace("</style>", BLOCKS_CSS + "</style>");
  }

  for (const key of Object.keys(hidden)) {
    if (hidden[key as keyof typeof hidden]) out = out.replace(new RegExp(`<section\\b[^>]*data-sec="${key}"[^>]*>[\\s\\S]*?</section>`), "");
  }
  return out;
}
