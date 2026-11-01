-- Painel de Sites — schema do Supabase
-- Cole tudo no SQL Editor do Supabase e clique em "Run".

-- Perfil de cada usuário do painel
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  sender_name text,          -- nome que assina as mensagens de abordagem
  sender_email text,
  sender_phone text,
  gemini_api_key text,       -- chave grátis do Google AI Studio (opcional)
  created_at timestamptz default now()
);

-- Negócios encontrados e salvos
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  name text not null,
  niche text not null,
  country text not null,
  city text,
  address text,
  phone text,
  intl_phone text,
  maps_url text,
  rating numeric,
  reviews integer,
  hours jsonb,
  email text,
  status text not null default 'novo',  -- novo | contatado | demo | fechado | perdido
  notes text,
  created_at timestamptz default now(),
  unique (user_id, place_id)
);

-- Sites gerados
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  template text not null,
  data jsonb not null,
  html text,
  is_public boolean not null default true,  -- link de demonstração /demo/<id>
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.sites enable row level security;

-- Cada usuário só vê e altera os próprios dados
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own leads" on public.leads;
create policy "own leads" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sites" on public.sites;
create policy "own sites" on public.sites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Qualquer pessoa com o link vê a demonstração.
-- Função em vez de policy pública: só devolve o HTML de um ID exato,
-- então ninguém consegue listar as demos de todos os usuários.
create or replace function public.get_demo_html(site_id uuid)
returns text language sql security definer set search_path = public stable as $$
  select html from public.sites where id = site_id and is_public = true;
$$;
grant execute on function public.get_demo_html(uuid) to anon, authenticated;

-- Cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, sender_name)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Limite diário de buscas por usuário (também em migrations/002_limite_buscas.sql)

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
