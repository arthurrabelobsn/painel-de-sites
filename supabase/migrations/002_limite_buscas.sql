-- Limite diário de buscas por usuário
-- Se você já rodou o schema.sql, rode SÓ este arquivo no SQL Editor.

create table if not exists public.search_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);

alter table public.search_usage enable row level security;

-- O usuário só pode LER o próprio uso. Não existe policy de insert/update/delete,
-- então ninguém consegue zerar o contador pelo navegador.
drop policy if exists "read own usage" on public.search_usage;
create policy "read own usage" on public.search_usage
  for select using (auth.uid() = user_id);

-- Consome 1 busca de forma atômica. Devolve o total usado hoje,
-- ou NULL se o limite já foi atingido. O dia vira à meia-noite de Brasília.
create or replace function public.consume_search(p_limit integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_used integer;
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_limit < 1 then
    return null;
  end if;

  insert into public.search_usage (user_id, day, count)
  values (auth.uid(), v_day, 1)
  on conflict (user_id, day) do update
    set count = public.search_usage.count + 1
    where public.search_usage.count < p_limit
  returning count into v_used;

  return v_used;
end;
$$;

-- Quantas buscas o usuário já fez hoje
create or replace function public.searches_today()
returns integer language sql security definer set search_path = public stable as $$
  select coalesce(
    (select count from public.search_usage
      where user_id = auth.uid()
        and day = (now() at time zone 'America/Sao_Paulo')::date),
    0);
$$;

revoke all on function public.consume_search(integer) from public, anon;
revoke all on function public.searches_today() from public, anon;
grant execute on function public.consume_search(integer) to authenticated;
grant execute on function public.searches_today() to authenticated;
