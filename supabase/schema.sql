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
