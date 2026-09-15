create extension if not exists pgcrypto;

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_discord_id text not null,
  guild_id text not null,
  thread_id text not null unique,
  sheet_message_id text,
  review_message_id text,
  status text not null default 'draft'
    check (status in ('draft','pending','changes_requested','approved','denied')),
  active_tab text not null default 'basic',
  data jsonb not null default '{}'::jsonb,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_owner_idx on public.characters(owner_discord_id);
create index if not exists characters_status_idx on public.characters(status);

create unique index if not exists characters_one_active_per_owner_idx
on public.characters(owner_discord_id)
where status in ('draft','pending','changes_requested','approved');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
before update on public.characters
for each row execute procedure public.set_updated_at();
