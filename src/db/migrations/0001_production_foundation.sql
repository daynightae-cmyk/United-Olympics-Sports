create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(), name text not null, name_ar text, status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists countries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), iso_code text not null,
  name text not null, name_ar text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists branches (
  id uuid primary key default gen_random_uuid(), country_id uuid not null references countries(id), name text not null, name_ar text,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists sports (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, name_ar text, status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists programs (
  id uuid primary key default gen_random_uuid(), branch_id uuid not null references branches(id), sport_id uuid not null references sports(id),
  name text not null, name_ar text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists groups (
  id uuid primary key default gen_random_uuid(), branch_id uuid not null references branches(id), program_id uuid not null references programs(id),
  name text not null, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists players (
  id uuid primary key default gen_random_uuid(), user_uid text unique, branch_id uuid references branches(id), full_name text not null,
  archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists guardians (
  id uuid primary key default gen_random_uuid(), user_uid text not null unique, full_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists player_guardians (
  id uuid primary key default gen_random_uuid(), player_id uuid not null references players(id), guardian_id uuid not null references guardians(id),
  relationship text, active integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(player_id, guardian_id)
);
create table if not exists coaches (
  id uuid primary key default gen_random_uuid(), user_uid text unique, branch_id uuid references branches(id), full_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references groups(id), starts_at timestamptz not null, ends_at timestamptz,
  status text not null default 'scheduled', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references sessions(id), player_id uuid not null references players(id),
  status text not null, recorded_by_uid text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(session_id, player_id)
);
create table if not exists performance_evaluations (
  id uuid primary key default gen_random_uuid(), player_id uuid not null references players(id), session_id uuid references sessions(id), coach_id uuid references coaches(id),
  metric_key text not null, score integer, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(), player_id uuid not null references players(id), program_id uuid not null references programs(id), status text not null default 'pending',
  currency text, amount_minor integer, starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists payments (
  id uuid primary key default gen_random_uuid(), subscription_id uuid references subscriptions(id), player_id uuid references players(id), provider text,
  provider_reference text, status text not null default 'pending', currency text, amount_minor integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists documents (
  id uuid primary key default gen_random_uuid(), owner_type text not null, owner_id uuid not null, storage_key text not null, mime_type text,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public_enquiries (
  id uuid primary key default gen_random_uuid(), reference text not null unique, name text not null, email text, phone text, message text, sport text,
  guardian_relationship text, status text not null default 'new', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(), reference text not null unique, requester_uid text not null, player_id uuid not null references players(id),
  kind text not null, status text not null default 'requested', payload jsonb not null default '{}'::jsonb, quoted_amount_minor integer, currency text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists catalog_products (
  id uuid primary key default gen_random_uuid(), sku text not null unique, name text not null, name_ar text, status text not null default 'draft',
  price_minor integer, currency text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(), product_id uuid not null unique references catalog_products(id), available_quantity integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists app_user_roles (
  id uuid primary key default gen_random_uuid(), uid text not null, role text not null, active integer not null default 1,
  organization_id uuid references organizations(id), country_id uuid references countries(id), branch_id uuid references branches(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(uid, role, organization_id, country_id, branch_id)
);
create table if not exists app_user_scopes (
  id uuid primary key default gen_random_uuid(), uid text not null, scope text not null, active integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(uid, scope)
);
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(), actor_uid text, action text not null, entity_type text not null, entity_id text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists idx_players_user_uid on players(user_uid);
create index if not exists idx_guardians_user_uid on guardians(user_uid);
create index if not exists idx_player_guardians_player on player_guardians(player_id);
create index if not exists idx_player_guardians_guardian on player_guardians(guardian_id);
create index if not exists idx_service_requests_requester on service_requests(requester_uid);
create index if not exists idx_service_requests_player on service_requests(player_id);
create index if not exists idx_app_user_roles_uid on app_user_roles(uid);
create index if not exists idx_app_user_scopes_uid on app_user_scopes(uid);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
