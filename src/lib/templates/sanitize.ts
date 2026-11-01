/**
 * Higieniza HTML vindo da IA para o bloco "custom".
 * Remove scripts, iframes, formulários, handlers (onclick…) e URLs javascript:.
 * O link público da demo também é servido com CSP "sandbox", como segunda barreira.
 */
const BLOCKED_TAGS = ["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "link", "meta", "base", "frame", "frameset", "svg", "math", "template", "noscript"];

export function sanitizeHtml(html: string): string {
  // Repete até estabilizar: remover uma tag pode "montar" outra (ex.: <scr<style></style>ipt>)
  let s = String(html ?? "").slice(0, 8000);
  for (let i = 0; i < 6; i++) {
    const next = sanitizeOnce(s);
    if (next === s) break;
    s = next;
  }
  return s.replace(/</g, (m, off, str) => (/^<\/?[a-z]/i.test(str.slice(off, off + 3)) ? m : "&lt;"));
}

function sanitizeOnce(input: string): string {
  let s = input;
  // remove tags bloqueadas com conteúdo
  for (const t of BLOCKED_TAGS) {
    s = s.replace(new RegExp(`<${t}\\b[\\s\\S]*?</${t}\\s*>`, "gi"), "");
    s = s.replace(new RegExp(`<\\/?${t}\\b[^>]*>`, "gi"), "");
  }
  // tags estruturais: tira a tag mas mantém o conteúdo (não pode confundir o layout do modelo)
  s = s.replace(/<\/?(html|head|body|title|section|header|footer|nav|main)\b[^>]*>/gi, "");
  // comentários (podem esconder truques de parser)
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // atributos de evento: onclick=, onerror=…
  s = s.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // URLs perigosas em href/src/style
  s = s.replace(/(href|src|xlink:href|action|formaction)\s*=\s*("|')\s*(javascript|vbscript|data):[^"']*\2/gi, '$1="#"');
  s = s.replace(/(href|src)\s*=\s*(javascript|vbscript|data):[^\s>]*/gi, '$1="#"');
  s = s.replace(/expression\s*\(/gi, "(");
  s = s.replace(/url\s*\(\s*['"]?\s*javascript:/gi, "url(");
  return s;
}
