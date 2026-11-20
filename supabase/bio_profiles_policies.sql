-- Run this script in Supabase Dashboard -> SQL Editor.
-- The frontend stores one profile per authenticated user, using auth.users.id
-- as bio_profiles.id.

alter table public.bio_profiles enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.bio_profiles to authenticated;

drop policy if exists "Users can read their own bio profile" on public.bio_profiles;
create policy "Users can read their own bio profile"
  on public.bio_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can create their own bio profile" on public.bio_profiles;
create policy "Users can create their own bio profile"
  on public.bio_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own bio profile" on public.bio_profiles;
create policy "Users can update their own bio profile"
  on public.bio_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own bio profile" on public.bio_profiles;
create policy "Users can delete their own bio profile"
  on public.bio_profiles
  for delete
  to authenticated
  using (auth.uid() = id);

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
