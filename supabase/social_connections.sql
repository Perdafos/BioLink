create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'tiktok-business', 'youtube')),
  account_id text,
  username text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  profile jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

alter table public.social_connections enable row level security;

drop policy if exists "Users can manage their social connections" on public.social_connections;

create policy "Users can manage their social connections"
  on public.social_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  return_url text not null,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;
