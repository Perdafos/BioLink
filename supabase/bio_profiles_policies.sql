-- Run this script in Supabase Dashboard -> SQL Editor.
-- Multiple pages belong to one authenticated account through owner_id.

alter table public.bio_profiles enable row level security;

-- bio_profiles.id is now the page ID, not a foreign key to auth.users.
-- Remove the old one-profile-per-user constraint when it exists.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.bio_profiles'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
  loop
    execute format(
      'alter table public.bio_profiles drop constraint %I',
      constraint_record.conname
    );
  end loop;
end;
$$;

alter table public.bio_profiles
  add column if not exists owner_id uuid;

update public.bio_profiles
set owner_id = id
where owner_id is null;

alter table public.bio_profiles
  alter column owner_id set not null;

alter table public.bio_profiles
  alter column owner_id set default auth.uid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.bio_profiles'::regclass
      and conname = 'bio_profiles_owner_id_fkey'
  ) then
    alter table public.bio_profiles
      add constraint bio_profiles_owner_id_fkey
      foreign key (owner_id)
      references auth.users(id)
      on delete cascade;
  end;
end;
$$;

create index if not exists bio_profiles_owner_id_idx
  on public.bio_profiles(owner_id);

alter table public.bio_profiles
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists no_index boolean not null default false,
  add column if not exists banner_url text not null default '',
  add column if not exists profile_shape text not null default 'circle',
  add column if not exists stickers jsonb not null default '[]'::jsonb;

alter table public.bio_profiles
  drop column if exists cutout_enabled,
  drop column if exists avatar_original_url;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.bio_profiles to authenticated;

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  delete from public.bio_profiles where owner_id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;

drop policy if exists "Users can read their own bio profile" on public.bio_profiles;
create policy "Users can read their own bio profile"
  on public.bio_profiles
  for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Users can create their own bio profile" on public.bio_profiles;
create policy "Users can create their own bio profile"
  on public.bio_profiles
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own bio profile" on public.bio_profiles;
create policy "Users can update their own bio profile"
  on public.bio_profiles
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own bio profile" on public.bio_profiles;
create policy "Users can delete their own bio profile"
  on public.bio_profiles
  for delete
  to authenticated
  using (auth.uid() = owner_id);

-- Registration checks username uniqueness before an account has a session.
-- Use a narrowly scoped function instead of exposing profile rows to anon.
create or replace function public.check_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.bio_profiles
    where username = p_username
  );
$$;

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text) to anon, authenticated;

create or replace function public.get_public_profile(p_username text)
returns setof public.bio_profiles
language sql
security definer
set search_path = public
as $$
  select *
  from public.bio_profiles
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

create or replace function public.increment_profile_link_click(p_username text, p_link_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.bio_profiles
  set links = (
    select coalesce(
      jsonb_agg(
        case
          when link_item->>'id' = p_link_id
          then jsonb_set(
            link_item,
            '{clicks}',
            to_jsonb(coalesce((link_item->>'clicks')::integer, 0) + 1),
            false
          )
          else link_item
        end
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(links, '[]'::jsonb)) as link_item
  )
  where lower(username) = lower(trim(p_username));

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

revoke all on function public.increment_profile_link_click(text, text) from public;
grant execute on function public.increment_profile_link_click(text, text) to anon, authenticated;
