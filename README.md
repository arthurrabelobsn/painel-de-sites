# Painel de Sites

Encontre negócios na Europa que têm telefone mas não têm site, gere uma demonstração do site deles no idioma do país e envie a abordagem pronta.

**Fluxo:** Localizar clientes → salvar lead → gerar site (3 modelos × 8 nichos, IA opcional) → exportar PDF / link de demo → mensagem de abordagem → publicar no Cloudflare Pages.

## Stack
- Next.js 16 (App Router) + Tailwind 4, fonte Satoshi
- Supabase (login, senha, recuperação de senha e banco)
- Google Places API (New) para encontrar os negócios
- Google Gemini (camada grátis) para personalizar os textos
- html2canvas-pro + jsPDF para o PDF; JSZip para o pacote do site

## Configuração (≈ 15 min)

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor** → cole o conteúdo de `supabase/schema.sql` → **Run**.
3. **Authentication → URL Configuration**:
   - *Site URL*: a URL do painel (ex.: `https://painel-de-sites.vercel.app`; em dev, `http://localhost:3000`)
   - *Redirect URLs*: adicione `https://SEU-DOMINIO/auth/callback` e `http://localhost:3000/auth/callback`
4. Copie a *Project URL* e a *anon key* (Project Settings → API).

> O envio de e-mails padrão do Supabase tem limite baixo por hora. Para produção, configure um SMTP (Resend, Brevo…) em Authentication → SMTP.

### 2. Google Places
1. [console.cloud.google.com](https://console.cloud.google.com) → crie um projeto e ative o faturamento (o Google dá uma cota mensal gratuita).
2. Ative **Places API (New)**.
3. Crie uma chave de API e restrinja-a à Places API (New).
4. Recomendo criar um **alerta de orçamento** no faturamento. A busca pede o campo `websiteUri`, que fica num SKU mais caro; cada clique em "Buscar" consulta até 3 páginas de 20 resultados.

### 3. Gemini (grátis)
Cada usuário cola a própria chave em **Configurações** (criada em [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Assim o seu custo é zero. Opcionalmente, defina `GEMINI_API_KEY` como chave padrão.

### Limite de buscas
Cada usuário pode fazer **3 buscas novas por dia** (renova à meia-noite de Brasília; "Carregar mais" não conta). O controle fica no banco, então não dá para burlar pelo navegador.
- Mudar o limite: variável `DAILY_SEARCH_LIMIT`.
- Liberar sem limite para alguns e-mails (ex.: o seu): `SEARCH_LIMIT_EXEMPT_EMAILS=voce@email.com`.
- Se você já tinha rodado o `schema.sql` antes desta versão, rode também `supabase/migrations/002_limite_buscas.sql`.

### 4. Rodar
```bash
cp .env.example .env.local   # preencha as chaves
npm install
npm run dev
```

### 5. Deploy na Vercel
Importe o repositório na Vercel e cadastre as mesmas variáveis de ambiente. Lembre de colocar a URL final no Supabase (passo 1.3).

## Estrutura
```
src/
  app/(auth)/           login, cadastro, esqueci-a-senha, nova-senha
  app/painel/           início, clientes (busca), leads, sites (editor), configurações
  app/api/places/       busca no Google Places (sem site + com telefone)
  app/api/ai/           personalização dos textos com Gemini (devolve JSON)
  app/demo/[id]/        link público da demonstração
  lib/data/             países, nichos (copy em 7 idiomas), mensagens de abordagem
  lib/templates/        modelos de site (Clássico, Impacto, Acolhedor)
supabase/schema.sql     tabelas + RLS
```

## Como adicionar
- **Nicho:** acrescente um item em `src/lib/data/niches.ts` (termo de busca + textos em cada idioma) e um ícone em `src/lib/templates/icons.ts`.
- **País:** acrescente em `COUNTRIES` (`src/lib/data/locales.ts`).
- **Modelo de site:** crie a função em `src/lib/templates/render.ts` e registre em `TEMPLATES`.

## Observações
- Os termos do Google limitam guardar dados do Places por muito tempo (o `place_id` pode ser guardado sem limite). Para uso em escala, considere atualizar ou apagar leads antigos periodicamente.
- Abordagem fria na Europa segue o GDPR e regras locais (a Alemanha é especialmente restritiva com e-mail frio). As mensagens já se identificam e oferecem opção de não ser mais contatado.
- O link de demonstração (`/demo/<id>`) é servido pelo próprio painel. Para o site final do cliente, use o botão **Publicar** (Cloudflare Pages: grátis, uso comercial permitido, domínio próprio).

## Acesso automático para quem compra na Hubla

A rota `POST /api/hubla` recebe o webhook da Hubla e cria o usuário no Supabase com a senha padrão
(e-mail já confirmado). Compras repetidas não duplicam o acesso; reembolsos e cancelamentos são ignorados.

1. Vercel → Settings → Environment Variables: `HUBLA_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_USER_PASSWORD`
   (e, se quiser filtrar, `HUBLA_PRODUCT_IDS`). Depois, Redeploy.
2. Hubla → Integrações → Webhook: URL `https://SEU-DOMINIO/api/hubla`, eventos de venda/acesso aprovado.
   Copie o token mostrado lá para `HUBLA_TOKEN`.
3. Teste pelo ambiente de testes da Hubla e confira em Vercel → Logs as linhas `[hubla]`.
4. Supabase → Authentication → Sign In / Providers: desligue "Allow new users to sign up" para que só quem comprou entre.

## E-mails

- **Boas-vindas** (enviado pelo painel quando a Hubla libera o acesso): configure `RESEND_API_KEY` e `EMAIL_FROM`.
  O texto fica em `src/lib/email.ts`.
- **Esqueci a senha, troca de e-mail, link mágico** (enviados pelo Supabase): cole os arquivos de
  `supabase/email-templates/` em Supabase → Authentication → Emails → Templates. Para chegarem a qualquer pessoa,
  configure SMTP próprio (Authentication → Emails → SMTP Settings), por exemplo o do Resend:
  host `smtp.resend.com`, porta `465`, usuário `resend`, senha = a API key do Resend.
- O cadastro público foi removido; desligue também "Allow new users to sign up" no Supabase.
