-- ============================================================
-- Mark Fruit — schema do banco (Supabase / PostgreSQL)
-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- É a "fonte da verdade" da estrutura: se precisar recriar o
-- banco do zero, é só rodar este arquivo de novo.
-- ============================================================

-- ----------------------------------------------------------------
-- TABELA: profiles  (estende auth.users com dados do Mark Fruit)
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'CONSUMER' check (role in ('CONSUMER','PRODUCER')),
  phone       text,
  city        text,
  state       text,
  bio         text,
  avatar      text,
  latitude    double precision,
  longitude   double precision,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABELA: posts  (anúncios de produtos)
-- ----------------------------------------------------------------
create table if not exists public.posts (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text not null,
  price       numeric(10,2) not null,
  image       text not null,
  category    text not null,
  is_seed     boolean not null default false,
  stock       integer not null default 1,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists posts_author_idx   on public.posts(author_id);
create index if not exists posts_category_idx on public.posts(category);

-- ----------------------------------------------------------------
-- TABELA: ratings  (avaliações dos produtos)
-- ----------------------------------------------------------------
create table if not exists public.ratings (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.posts(id) on delete cascade,
  user_id     uuid   not null references public.profiles(id) on delete cascade,
  stars       integer not null check (stars between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)   -- 1 avaliação por pessoa por produto
);
create index if not exists ratings_post_idx on public.ratings(post_id);

-- ----------------------------------------------------------------
-- TABELA: messages  (chat entre consumidor e produtor)
-- ----------------------------------------------------------------
create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.posts(id) on delete cascade,
  sender_id   uuid   not null references public.profiles(id) on delete cascade,
  receiver_id uuid   not null references public.profiles(id) on delete cascade,
  content     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists messages_post_idx     on public.messages(post_id);
create index if not exists messages_sender_idx   on public.messages(sender_id);
create index if not exists messages_receiver_idx on public.messages(receiver_id);

-- ----------------------------------------------------------------
-- TRIGGER: cria profile automaticamente quando alguém se cadastra
-- Os dados (name, role, etc.) vêm no metadata do signup.
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, phone, city, state)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'role', 'CONSUMER'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- TRIGGER: mantém updated_at sempre atualizado
-- ----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Liga a segurança em todas as tabelas e define quem pode o quê.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.ratings  enable row level security;
alter table public.messages enable row level security;

-- ---------- PROFILES ----------
-- Qualquer um pode ver perfis (pra mostrar nome do vendedor, etc.)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- Cada um só edita o próprio perfil
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------- POSTS ----------
-- Qualquer um (logado ou não) pode ver os anúncios
drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts
  for select using (true);

-- Só produtores criam, e só como autor deles mesmos
drop policy if exists "posts_insert_producer" on public.posts;
create policy "posts_insert_producer" on public.posts
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'PRODUCER'
    )
  );

-- Só o dono edita / apaga o próprio anúncio
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update using (auth.uid() = author_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = author_id);

-- ---------- RATINGS ----------
-- Todo mundo vê as avaliações
drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all" on public.ratings
  for select using (true);

-- Só usuário logado avalia, e só em nome dele mesmo
drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own" on public.ratings
  for insert with check (auth.uid() = user_id);

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own" on public.ratings
  for update using (auth.uid() = user_id);

drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own" on public.ratings
  for delete using (auth.uid() = user_id);

-- ---------- MESSAGES ----------
-- Só vê as mensagens em que você é remetente ou destinatário
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

-- Só envia mensagem em seu próprio nome
drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Destinatário pode marcar como lida
drop policy if exists "messages_update_receiver" on public.messages;
create policy "messages_update_receiver" on public.messages
  for update using (auth.uid() = receiver_id);

-- ============================================================
-- REALTIME — habilita o chat em tempo real na tabela messages
-- ============================================================
alter publication supabase_realtime add table public.messages;

-- ============================================================
-- STORAGE — bucket público pras imagens dos produtos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Qualquer um vê as imagens (bucket público)
drop policy if exists "post_images_select" on storage.objects;
create policy "post_images_select" on storage.objects
  for select using (bucket_id = 'post-images');

-- Só usuário logado faz upload
drop policy if exists "post_images_insert" on storage.objects;
create policy "post_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'post-images' and auth.role() = 'authenticated'
  );

-- Usuário logado pode apagar/atualizar imagens que subiu
drop policy if exists "post_images_update" on storage.objects;
create policy "post_images_update" on storage.objects
  for update using (
    bucket_id = 'post-images' and auth.role() = 'authenticated'
  );

drop policy if exists "post_images_delete" on storage.objects;
create policy "post_images_delete" on storage.objects
  for delete using (
    bucket_id = 'post-images' and auth.role() = 'authenticated'
  );

-- ============================================================
-- Fim do schema. Depois rode o seed.sql para popular os produtos.
-- ============================================================
