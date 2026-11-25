-- Run once in Supabase Dashboard -> SQL Editor to enable public audience signups.
create table if not exists public.bio_audience_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.bio_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  constraint bio_audience_contacts_profile_email_key unique (profile_id, email)
);

alter table public.bio_audience_contacts enable row level security;

revoke all on public.bio_audience_contacts from anon, authenticated, public;
grant select, insert, delete on public.bio_audience_contacts to authenticated;

create index if not exists bio_audience_contacts_profile_created_at_idx
  on public.bio_audience_contacts(profile_id, created_at desc);

drop policy if exists "Owners can read audience contacts" on public.bio_audience_contacts;
create policy "Owners can read audience contacts"
  on public.bio_audience_contacts
  for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Owners can add audience contacts" on public.bio_audience_contacts;
create policy "Owners can add audience contacts"
  on public.bio_audience_contacts
  for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.bio_profiles
      where bio_profiles.id = bio_audience_contacts.profile_id
        and bio_profiles.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete audience contacts" on public.bio_audience_contacts;
create policy "Owners can delete audience contacts"
  on public.bio_audience_contacts
  for delete
  to authenticated
  using (auth.uid() = owner_id);

create or replace function public.subscribe_to_biolink_audience(
  p_username text,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_owner_id uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_inserted_count integer;
begin
  if length(v_email) > 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    return 'invalid_email';
  end if;

  select id, owner_id
    into v_profile_id, v_owner_id
  from public.bio_profiles
  where lower(username) = lower(trim(coalesce(p_username, '')))
  limit 1;

  if v_profile_id is null then
    return 'profile_not_found';
  end if;

  insert into public.bio_audience_contacts (profile_id, owner_id, email)
  values (v_profile_id, v_owner_id, v_email)
  on conflict (profile_id, email) do nothing;

  get diagnostics v_inserted_count = row_count;
  if v_inserted_count = 0 then
    return 'already_subscribed';
  end if;

  return 'subscribed';
end;
$$;

revoke all on function public.subscribe_to_biolink_audience(text, text) from public;
grant execute on function public.subscribe_to_biolink_audience(text, text) to anon, authenticated;
