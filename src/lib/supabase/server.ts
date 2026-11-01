import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de um Server Component: o proxy já renova a sessão.
          }
        },
      },
    }
  );
}

export type SessionUser = { id: string; email: string | null; name: string };

/**
 * Usuário logado, validado pelo JWT localmente (getClaims) — sem ida ao servidor
 * de autenticação a cada página. `cache` evita repetir a leitura no mesmo request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const c = data?.claims;
  if (!c?.sub) return null;
  const meta = (c.user_metadata ?? {}) as { full_name?: string };
  return { id: c.sub, email: (c.email as string) ?? null, name: meta.full_name || (c.email as string) || "" };
});
