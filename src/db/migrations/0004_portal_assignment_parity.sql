-- ==============================================================================
-- United Olympics Sports - Migration 0004
-- Portal assignment parity (matches verified Supabase production schema)
-- ==============================================================================

alter table players
  add column if not exists group_id uuid references groups(id);

create table if not exists coach_groups (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_id, group_id)
);

create index if not exists idx_players_group_id on players(group_id);
create index if not exists idx_coach_groups_coach on coach_groups(coach_id) where active = true;
create index if not exists idx_coach_groups_group on coach_groups(group_id) where active = true;

-- Fail closed through the Supabase Data API until explicit policies are present.
alter table coach_groups enable row level security;