"use client";

import { renderSite } from "./templates/render";
import type { SiteData } from "./templates/types";

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "site";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Baixa um .zip com index.html, pronto para arrastar no Cloudflare Pages / Netlify Drop */
export async function downloadZip(data: SiteData) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file("index.html", renderSite({ ...data, showDemoBadge: false }));
  const blob = await zip.generateAsync({ type: "blob" });
  download(blob, `${slugify(data.name)}.zip`);
}

export function downloadHtml(data: SiteData) {
  download(new Blob([renderSite({ ...data, showDemoBadge: false })], { type: "text/html" }), "index.html");
}

/** Gera o PDF do site renderizando numa janela invisível de 1280px */
export async function exportPdf(data: SiteData) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const html = renderSite(data, { forPdf: true });

  // Carrega as mesmas fontes do site no documento principal (o canvas usa as fontes daqui)
  const fontHref = html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
  if (fontHref && !document.querySelector(`link[href="${fontHref}"]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = fontHref;
    document.head.appendChild(l);
  }

  const iframe = document.createElement("iframe");
  // sem allow-scripts: nada do HTML do site roda no domínio do painel
  iframe.setAttribute("sandbox", "allow-same-origin");
  Object.assign(iframe.style, { position: "fixed", left: "-10000px", top: "0", width: "1280px", height: "900px", border: "0" });
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });
    const doc = iframe.contentDocument!;
    await doc.fonts?.ready;
    await document.fonts?.ready;
    await new Promise((r) => setTimeout(r, 400));

    const height = doc.documentElement.scrollHeight;
    iframe.style.height = `${height}px`;
    await new Promise((r) => setTimeout(r, 150));

    const canvas = await html2canvas(doc.documentElement, {
      width: 1280,
      height,
      windowWidth: 1280,
      windowHeight: height,
      scale: 1.5,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    // Fatias com proporção A4 em pé, mantendo a largura do site
    const pageW = 1280;
    const pageH = Math.round(pageW * 1.414);
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [pageW, pageH], hotfixes: ["px_scaling"] });
    const scale = canvas.width / pageW;
    const sliceH = Math.round(pageH * scale);
    const pages = Math.ceil(canvas.height / sliceH);

    for (let i = 0; i < pages; i++) {
      const part = document.createElement("canvas");
      part.width = canvas.width;
      part.height = Math.min(sliceH, canvas.height - i * sliceH);
      const ctx = part.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, part.width, part.height);
      ctx.drawImage(canvas, 0, i * sliceH, canvas.width, part.height, 0, 0, canvas.width, part.height);
      if (i > 0) pdf.addPage([pageW, pageH], "portrait");
      pdf.addImage(part.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, pageW, part.height / scale);
    }
    pdf.save(`${slugify(data.name)}-demo.pdf`);
  } finally {
    iframe.remove();
  }
}

/** Reduz imagens enviadas para não pesar o site */
export function resizeImage(file: File, maxSize: number, type: "image/jpeg" | "image/png" = "image/jpeg"): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * ratio);
      c.height = Math.round(img.height * ratio);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL(type, 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
