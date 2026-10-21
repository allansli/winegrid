-- ============================================================================
-- WINEGRID - SUPABASE POSTGRES SCHEMA, RLS & RPC MIGRATION
-- Project: WineGrid (ssxhqcdrpxupauoisxro)
-- Follows Supabase Postgres Best Practices & Security Advisor Guidelines
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE (Supports Authenticated Users + Linked Anonymous History)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sommelier_title text not null default 'Cellar Apprentice',
  avatar_url text,
  anon_device_id text,
  games_played integer not null default 0,
  games_won integer not null default 0,
  perfect_grids integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  best_rarity_score numeric(6,2),
  avg_rarity_score numeric(6,2),
  last_played_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. WINE ENTITIES CATALOG (Appellations, Grape Varieties, Iconic Producers)
create table if not exists public.wine_entities (
  id text primary key,
  name text not null,
  canonical_name text not null,
  entity_type text not null check (entity_type in ('appellation', 'grape', 'producer')),
  country text not null,
  region text not null,
  subregion text,
  aliases text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  base_rarity integer not null default 50 check (base_rarity between 1 and 100),
  sommelier_note text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wine_entities_type on public.wine_entities(entity_type);
create index if not exists idx_wine_entities_country on public.wine_entities(country);
create index if not exists idx_wine_entities_attributes on public.wine_entities using gin (attributes);

-- 3. DAILY BOARDS TABLE
create table if not exists public.daily_boards (
  board_date date not null,
  board_mode text not null default 'daily',
  difficulty text not null default 'wset3',
  row_clues jsonb not null,
  col_clues jsonb not null,
  valid_counts integer[] not null,
  total_plays integer not null default 0,
  avg_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (board_date, board_mode)
);

-- 4. GAME SESSIONS TABLE (Stores both Anonymous & Authenticated Plays)
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anon_id text not null,
  board_id text not null,
  board_date date,
  game_mode text not null check (game_mode in ('daily', 'unlimited')),
  difficulty text not null default 'wset3',
  entity_filter text not null default 'all',
  row_clue_ids text[] not null,
  col_clue_ids text[] not null,
  cells_state jsonb not null default '[]'::jsonb,
  guesses_remaining integer not null default 10,
  correct_cells integer not null default 0,
  rarity_score numeric(6,2) not null default 900.00,
  is_completed boolean not null default false,
  is_won boolean not null default false,
  duration_seconds integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_game_sessions_user_id on public.game_sessions(user_id);
create index if not exists idx_game_sessions_anon_id on public.game_sessions(anon_id);
create index if not exists idx_game_sessions_board_id on public.game_sessions(board_id);

-- 5. GLOBAL CELL PICK RARITY STATS (Powers GeoGrid-style % Rarity Scoring)
create table if not exists public.cell_pick_stats (
  row_clue_id text not null,
  col_clue_id text not null,
  entity_id text not null,
  pick_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (row_clue_id, col_clue_id, entity_id)
);

create index if not exists idx_cell_pick_pair on public.cell_pick_stats(row_clue_id, col_clue_id);

-- 6. FIRST-PARTY OBSERVABILITY & USAGE TELEMETRY
create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  anon_id text not null,
  session_id text,
  properties jsonb not null default '{}'::jsonb,
  page_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_event_name on public.telemetry_events(event_name);
create index if not exists idx_telemetry_user_id on public.telemetry_events(user_id);
create index if not exists idx_telemetry_created_at on public.telemetry_events(created_at desc);

-- ============================================================================
-- RPC FUNCTIONS FOR RARITY SCORING & ANONYMOUS-TO-USER HISTORY MERGE
-- ============================================================================

create or replace function public.record_cell_pick(
  p_row_clue_id text,
  p_col_clue_id text,
  p_entity_id text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_entity_picks integer;
  v_total_picks integer;
  v_percentage numeric(5,2);
begin
  insert into public.cell_pick_stats (row_clue_id, col_clue_id, entity_id, pick_count, updated_at)
  values (p_row_clue_id, p_col_clue_id, p_entity_id, 1, now())
  on conflict (row_clue_id, col_clue_id, entity_id)
  do update set
    pick_count = public.cell_pick_stats.pick_count + 1,
    updated_at = now()
  returning pick_count into v_entity_picks;

  select coalesce(sum(pick_count), 1)
  into v_total_picks
  from public.cell_pick_stats
  where row_clue_id = p_row_clue_id
    and col_clue_id = p_col_clue_id;

  v_percentage := round((v_entity_picks::numeric / greatest(v_total_picks, 1)::numeric) * 100.0, 1);

  return jsonb_build_object(
    'entity_picks', v_entity_picks,
    'total_picks', v_total_picks,
    'percentage', v_percentage
  );
end;
$$;

create or replace function public.claim_anonymous_history(
  p_anon_id text
)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid;
  v_claimed integer := 0;
begin
  v_uid := (select auth.uid());
  if v_uid is null or p_anon_id is null or length(trim(p_anon_id)) = 0 then
    return 0;
  end if;

  update public.game_sessions
  set user_id = v_uid,
      updated_at = now()
  where anon_id = p_anon_id
    and user_id is null;

  get diagnostics v_claimed = row_count;

  insert into public.profiles (id, anon_device_id, games_played, games_won, perfect_grids, best_rarity_score, avg_rarity_score, updated_at)
  select
    v_uid,
    p_anon_id,
    count(*) filter (where is_completed),
    count(*) filter (where is_won),
    count(*) filter (where correct_cells = 9),
    min(rarity_score) filter (where is_won),
    avg(rarity_score) filter (where is_won),
    now()
  from public.game_sessions
  where user_id = v_uid
  on conflict (id) do update set
    anon_device_id = excluded.anon_device_id,
    games_played = excluded.games_played,
    games_won = excluded.games_won,
    perfect_grids = excluded.perfect_grids,
    best_rarity_score = excluded.best_rarity_score,
    avg_rarity_score = excluded.avg_rarity_score,
    updated_at = now();

  return v_claimed;
end;
$$;

-- ============================================================================
-- EXPLICIT DATA API GRANTS & ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

grant usage on schema public to anon, authenticated;
grant select on public.wine_entities to anon, authenticated;
grant select on public.daily_boards to anon, authenticated;
grant select, insert, update on public.cell_pick_stats to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant select, insert, update on public.game_sessions to anon, authenticated;
grant select, insert on public.telemetry_events to anon, authenticated;
grant execute on function public.record_cell_pick(text, text, text) to anon, authenticated;
grant execute on function public.claim_anonymous_history(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.wine_entities enable row level security;
alter table public.daily_boards enable row level security;
alter table public.game_sessions enable row level security;
alter table public.cell_pick_stats enable row level security;
alter table public.telemetry_events enable row level security;

-- Drop existing policies if re-running idempotently
drop policy if exists "Public read wine_entities" on public.wine_entities;
drop policy if exists "Public read daily_boards" on public.daily_boards;
drop policy if exists "Public read cell_pick_stats" on public.cell_pick_stats;
drop policy if exists "Insert cell_pick_stats" on public.cell_pick_stats;
drop policy if exists "Update cell_pick_stats" on public.cell_pick_stats;
drop policy if exists "Public read profiles" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Insert game_sessions" on public.game_sessions;
drop policy if exists "Read game_sessions" on public.game_sessions;
drop policy if exists "Update game_sessions" on public.game_sessions;
drop policy if exists "Insert telemetry_events" on public.telemetry_events;
drop policy if exists "Read telemetry_events" on public.telemetry_events;

-- Public read access for wine catalog, daily boards, and cell pick stats
create policy "Public read wine_entities"
  on public.wine_entities for select
  to anon, authenticated
  using (true);

create policy "Public read daily_boards"
  on public.daily_boards for select
  to anon, authenticated
  using (true);

create policy "Public read cell_pick_stats"
  on public.cell_pick_stats for select
  to anon, authenticated
  using (true);

create policy "Insert cell_pick_stats"
  on public.cell_pick_stats for insert
  to anon, authenticated
  with check (pick_count >= 1 and length(entity_id) > 0);

create policy "Update cell_pick_stats"
  on public.cell_pick_stats for update
  to anon, authenticated
  using (pick_count >= 1)
  with check (pick_count >= 1);

-- Profiles: public leaderboard read, authenticated self write
create policy "Public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Game sessions: allow anonymous (user_id is null) and authenticated ownership
create policy "Insert game_sessions"
  on public.game_sessions for insert
  to anon, authenticated
  with check (
    (user_id is null and length(anon_id) > 0)
    or ((select auth.uid()) = user_id)
  );

create policy "Read game_sessions"
  on public.game_sessions for select
  to anon, authenticated
  using (true);

create policy "Update game_sessions"
  on public.game_sessions for update
  to anon, authenticated
  using (
    (user_id is null and length(anon_id) > 0)
    or ((select auth.uid()) = user_id)
  )
  with check (
    (user_id is null and length(anon_id) > 0)
    or ((select auth.uid()) = user_id)
  );

-- Telemetry: allow client inserts (anon or authenticated)
create policy "Insert telemetry_events"
  on public.telemetry_events for insert
  to anon, authenticated
  with check (
    (user_id is null and length(anon_id) > 0)
    or ((select auth.uid()) = user_id)
  );

create policy "Read telemetry_events"
  on public.telemetry_events for select
  to anon, authenticated
  using (true);
