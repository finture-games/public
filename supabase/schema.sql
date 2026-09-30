-- Skema Supabase untuk Finture (jalankan di SQL Editor Supabase)
-- Semua tabel milik pengguna memakai RLS; tabel konten hanya bisa dibaca publik.

-- ============ PROFILES ============
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null default 'Petualang',
  school text,
  avatar text not null default '🦊',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Own profile read" on profiles for select using (auth.uid() = id);
create policy "Own profile write" on profiles for insert with check (auth.uid() = id);
create policy "Own profile update" on profiles for update using (auth.uid() = id);

-- ============ GAME SESSIONS ============
create table if not exists game_sessions (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  character_id text not null,
  position int not null default 1,
  day int not null default 1,
  money int not null default 0,
  savings int not null default 0,
  aspect_scores jsonb not null default '{}',
  status text not null default 'active',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table game_sessions enable row level security;
create policy "Own sessions read" on game_sessions for select using (auth.uid() = user_id);
create policy "Own sessions write" on game_sessions for insert with check (auth.uid() = user_id);
create policy "Own sessions update" on game_sessions for update using (auth.uid() = user_id);

-- ============ SESSION DECISIONS ============
create table if not exists session_decisions (
  id bigint generated always as identity primary key,
  session_id text not null references game_sessions(id) on delete cascade,
  card_id text not null,
  choice_id text not null,
  day int,
  created_at timestamptz not null default now()
);

alter table session_decisions enable row level security;
create policy "Own decisions" on session_decisions for all
  using (exists (select 1 from game_sessions g where g.id = session_id and g.user_id = auth.uid()))
  with check (exists (select 1 from game_sessions g where g.id = session_id and g.user_id = auth.uid()));

-- ============ REFLECTIONS ============
create table if not exists reflections (
  id bigint generated always as identity primary key,
  session_id text not null references game_sessions(id) on delete cascade,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table reflections enable row level security;
create policy "Own reflections" on reflections for all
  using (exists (select 1 from game_sessions g where g.id = session_id and g.user_id = auth.uid()))
  with check (exists (select 1 from game_sessions g where g.id = session_id and g.user_id = auth.uid()));

-- ============ TABEL KONTEN (read-only publik) ============
create table if not exists characters (
  id text primary key,
  name text not null,
  background text,
  weekly_allowance int not null,
  start_money int not null,
  target_name text not null,
  target_amount int not null
);

create table if not exists tiles (
  index int primary key,
  type text not null
);

create table if not exists scenario_cards (
  id text primary key,
  tile_type text not null,
  title text not null,
  story text not null,
  is_active boolean not null default true
);

create table if not exists card_choices (
  id bigint generated always as identity primary key,
  card_id text not null references scenario_cards(id) on delete cascade,
  label text not null,
  money_delta int not null default 0,
  savings_delta int not null default 0,
  aspect_deltas jsonb not null default '{}',
  explanation text not null
);

create table if not exists learning_materials (
  id bigint generated always as identity primary key,
  aspect text not null,
  title text not null,
  body text not null,
  tip text not null
);

-- Konten bisa dibaca siapa saja (termasuk anon), hanya admin/service yang menulis.
alter table characters enable row level security;
alter table tiles enable row level security;
alter table scenario_cards enable row level security;
alter table card_choices enable row level security;
alter table learning_materials enable row level security;

create policy "Public read characters" on characters for select using (true);
create policy "Public read tiles" on tiles for select using (true);
create policy "Public read cards" on scenario_cards for select using (true);
create policy "Public read choices" on card_choices for select using (true);
create policy "Public read materials" on learning_materials for select using (true);
