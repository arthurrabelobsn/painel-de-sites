/**
 * E-mails transacionais enviados pelo próprio painel (via Resend).
 * Os e-mails de "esqueci a senha" e afins são do Supabase: os modelos ficam em supabase/email-templates/.
 *
 * Variáveis: RESEND_API_KEY, EMAIL_FROM ("Painel de Sites <acesso@seudominio.com>"), APP_URL, APP_NAME (opcional)
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Moldura comum: mesma aparência dos modelos do Supabase */
export function emailLayout(title: string, inner: string, appName: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#15140f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ec;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:36px;height:36px;border-radius:10px;background:#ff5a1f;color:#fff;font-weight:800;font-size:18px;text-align:center;line-height:36px">P</td>
<td style="padding-left:10px;font-weight:800;font-size:17px">${esc(appName)}</td></tr></table></td></tr>
<tr><td style="background:#ffffff;border-radius:18px;padding:32px 28px">${inner}</td></tr>
<tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.5;color:#8a877d">Você recebeu este e-mail porque tem acesso ao ${esc(appName)}. Se não reconhece, pode ignorar.</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0"><tr><td style="border-radius:12px;background:#15140f"><a href="${href}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none">${esc(label)}</a></td></tr></table>`;

export function welcomeEmail(opts: { name: string; email: string; password: string; appUrl: string; appName: string }) {
  const first = opts.name.split(/\s+/)[0] || "";
  const login = `${opts.appUrl.replace(/\/$/, "")}/login`;
  const inner = `
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;letter-spacing:-0.02em">${first ? `${esc(first)}, seu` : "Seu"} acesso está liberado</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4a4840">Obrigado pela compra! Já pode entrar no ${esc(opts.appName)} para encontrar clientes e criar os sites de demonstração.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ec;border-radius:12px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.7">
<b>E-mail:</b> ${esc(opts.email)}<br/><b>Senha:</b> <span style="font-family:Menlo,Consolas,monospace">${esc(opts.password)}</span></td></tr></table>
${button(login, "Entrar no painel")}
<p style="margin:0;font-size:14px;line-height:1.6;color:#4a4840">Por segurança, troque a senha no primeiro acesso em <b>Configurações</b>. Se esquecer, use “Esqueci a senha” na tela de login.</p>`;
  return {
    subject: `Seu acesso ao ${opts.appName} está liberado`,
    html: emailLayout(`Acesso liberado`, inner, opts.appName),
    text: `Seu acesso ao ${opts.appName} está liberado.\n\nE-mail: ${opts.email}\nSenha: ${opts.password}\n\nEntre em: ${login}\n\nTroque a senha no primeiro acesso em Configurações.`,
  };
}

/** Envia pelo Resend. Sem RESEND_API_KEY, não envia nada (e não quebra o fluxo). */
export async function sendEmail(to: string, msg: { subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { skipped: true as const };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: msg.subject, html: msg.html, text: msg.text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return { sent: true as const };
}
