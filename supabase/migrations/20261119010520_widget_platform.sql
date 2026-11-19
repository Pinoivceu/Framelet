create type public.widget_type as enum ('clock', 'countdown', 'quote', 'progress', 'pomodoro');
create type public.widget_theme_mode as enum ('light', 'dark', 'system');
create type public.widget_font_family as enum ('sans', 'serif', 'mono', 'rounded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Widget',
  type public.widget_type not null,
  theme_mode public.widget_theme_mode not null default 'system',
  font_family public.widget_font_family not null default 'sans',
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index widgets_user_id_updated_at_idx
  on public.widgets (user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.widgets enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Widgets are publicly readable"
  on public.widgets
  for select
  to anon, authenticated
  using (true);

create policy "Users can create their own widgets"
  on public.widgets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own widgets"
  on public.widgets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own widgets"
  on public.widgets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.profiles from anon, authenticated;
grant select (id, email, full_name, avatar_url, created_at)
  on public.profiles to authenticated;
grant update (full_name, avatar_url)
  on public.profiles to authenticated;

revoke all on table public.widgets from anon, authenticated;
grant select (id, title, type, theme_mode, font_family, config, created_at, updated_at)
  on public.widgets to anon;
grant select, insert, update, delete
  on public.widgets to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, full_name, avatar_url)
select
  users.id,
  coalesce(users.email, ''),
  nullif(users.raw_user_meta_data ->> 'full_name', ''),
  nullif(users.raw_user_meta_data ->> 'avatar_url', '')
from auth.users as users
on conflict (id) do nothing;

create function public.touch_widget_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_widget_updated_at() from public, anon, authenticated;

create trigger set_widget_updated_at
  before update on public.widgets
  for each row execute procedure public.touch_widget_updated_at();
