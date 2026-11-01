import { createClient } from "@supabase/supabase-js";

// Link público da demonstração: /demo/<id-do-site>
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.rpc("get_demo_html", { site_id: id });
  if (error || !data) return new Response("Not found", { status: 404 });

  return new Response(data as string, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      // A demo roda isolada: sem scripts e sem acesso aos cookies do painel
      "Content-Security-Policy":
        "sandbox allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation; script-src 'none'; object-src 'none'; base-uri 'none'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60",
    },
  });
}
