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
.xb{padding:var(--sec,120px) 0}
.xb .xh{margin-bottom:clamp(36px,4vw,64px)}
.xb .xh h2{font-size:clamp(42px,5.4vw,104px);line-height:var(--dl,1);max-width:16ch}
.xb .xh p{font-size:clamp(19px,1.45vw,22px);max-width:34em;margin-top:24px}
.xb .xg{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:8px}
.xb .xc{background:var(--surf);border-radius:var(--rc,0);padding:clamp(24px,2.4vw,36px)}
.xb .xc h3{font-size:clamp(22px,2vw,30px);margin-bottom:10px}
.xb ol.xg{counter-reset:st}
.xb ol.xg .xc{counter-increment:st}
.xb ol.xg .xc::before{content:counter(st);display:block;font:var(--dw,700) clamp(40px,4vw,64px)/1 var(--fd);color:var(--act-t);margin-bottom:20px}
.xb .xprice{font:var(--dw,700) clamp(32px,3vw,48px)/1 var(--fd);color:var(--act-t);margin:8px 0 14px;font-variant-numeric:tabular-nums}
.xb .xfaq{display:grid;gap:8px;max-width:960px}
.xb .xtext{max-width:38em;font-size:19px;line-height:1.65}
.xb .xtext p+p{margin-top:18px}
.xcta{padding:clamp(72px,8vw,128px) 0;background:var(--act);color:var(--on-act)}
.xcta .box{display:flex;flex-wrap:wrap;gap:32px;align-items:flex-end;justify-content:space-between}
.xcta h2{font-size:clamp(40px,5vw,96px);line-height:var(--dl,1);max-width:14ch}
.xcta p{font-size:clamp(19px,1.45vw,22px);max-width:30em;margin-top:20px}
.xcta a{display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 28px;border-radius:var(--rb,999px);background:var(--on-act);color:var(--act);font-weight:600;transition:transform 160ms var(--ease-out)}
.xcta a:active{transform:scale(.97)}
.xcustom{max-width:100%;overflow-wrap:anywhere}
.xcustom img{max-width:100%;height:auto}
.xcustom p+p{margin-top:14px}
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
      return `<section class="xb" data-block="${esc(b.id)}"><div class="wrap">${head}<ol class="xg">${items
        .map((it) => `<li class="xc"><h3>${esc(it.title)}</h3>${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</li>`)
        .join("")}</ol></div></section>`;
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

/** As seções extras herdam as variáveis de cor do modelo (definidas no :root pelo renderizador) */
function themeVars(_d: SiteData) {
  return "";
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
        .map((b) => (vars ? blockHtml(d, b).replace(/^<section /, `<section style="${vars}" `) : blockHtml(d, b)))
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
