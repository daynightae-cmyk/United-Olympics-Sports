-- ==============================================================================
-- United Olympics Sports - Migration 0006
-- Live RLS Policy Closure, Sensitive Table Isolation & Schema Parity
-- ==============================================================================

-- 1. Create auth schema and auth.uid() function if not already present (Supabase parity)
create schema if not exists auth;
create or replace function auth.uid() returns text as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '');
$$ language sql stable;

-- 2. Schema Parity: app_user_profiles table (table 33)
create table if not exists app_user_profiles (
  user_id uuid primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table app_user_profiles enable row level security;

-- 3. Schema Parity: Add is_public flag to achievements for safe public scoping
alter table achievements add column if not exists is_public boolean not null default false;
create index if not exists idx_achievements_public on achievements(is_public) where is_public = true;

-- 4. Enable RLS on all 33 base tables (defense-in-depth)
alter table if exists organizations enable row level security;
alter table if exists countries enable row level security;
alter table if exists branches enable row level security;
alter table if exists sports enable row level security;
alter table if exists programs enable row level security;
alter table if exists groups enable row level security;
alter table if exists players enable row level security;
alter table if exists guardians enable row level security;
alter table if exists player_guardians enable row level security;
alter table if exists coaches enable row level security;
alter table if exists coach_groups enable row level security;
alter table if exists sessions enable row level security;
alter table if exists attendance enable row level security;
alter table if exists performance_evaluations enable row level security;
alter table if exists subscriptions enable row level security;
alter table if exists payments enable row level security;
alter table if exists documents enable row level security;
alter table if exists public_enquiries enable row level security;
alter table if exists service_requests enable row level security;
alter table if exists catalog_products enable row level security;
alter table if exists inventory enable row level security;
alter table if exists app_user_roles enable row level security;
alter table if exists app_user_scopes enable row level security;
alter table if exists audit_logs enable row level security;
alter table if exists notifications enable row level security;
alter table if exists achievements enable row level security;
alter table if exists events enable row level security;
alter table if exists announcements enable row level security;
alter table if exists messages enable row level security;
alter table if exists payment_intents enable row level security;
alter table if exists payment_webhooks enable row level security;
alter table if exists orders enable row level security;
alter table if exists app_user_profiles enable row level security;

-- 5. Revoke anonymous access on sensitive tables (ensure Supabase roles exist idempotently)
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end $$;

revoke all on public.payment_webhooks from anon;
revoke all on public.payment_intents from anon;
revoke all on public.orders from anon;
revoke all on public.messages from anon;
revoke all on public.notifications from anon;

-- 6. Strict RLS Policies for Sensitive Tables (No anonymous read)
-- Notifications: Recipient scoped
drop policy if exists "notifications_recipient_read" on public.notifications;
create policy "notifications_recipient_read" on public.notifications
  for select using (auth.uid() is not null and recipient_uid = auth.uid());

-- Messages: Participant scoped
drop policy if exists "messages_participant_read" on public.messages;
create policy "messages_participant_read" on public.messages
  for select using (auth.uid() is not null and (sender_uid = auth.uid() or recipient_uid = auth.uid()));

-- Orders: Customer scoped
drop policy if exists "orders_customer_read" on public.orders;
create policy "orders_customer_read" on public.orders
  for select using (auth.uid() is not null and customer_uid = auth.uid());

-- Players: Authenticated read
drop policy if exists "players_authenticated_read" on public.players;
create policy "players_authenticated_read" on public.players
  for select using (auth.uid() is not null);

-- Payment Intents: Player / Owner scoped
drop policy if exists "payment_intents_owner_read" on public.payment_intents;
create policy "payment_intents_owner_read" on public.payment_intents
  for select using (
    auth.uid() is not null and player_id in (select id from public.players where user_uid = auth.uid())
  );

-- Payment Webhooks: SERVER_ONLY (zero client policies, fail-closed deny all)
drop policy if exists "payment_webhooks_anon_read" on public.payment_webhooks;
drop policy if exists "payment_webhooks_authenticated_read" on public.payment_webhooks;

-- 7. Public Engagement Tables (Narrowly scoped read)
-- Events: Only scheduled or published events
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (status in ('scheduled', 'published'));

-- Announcements: Only active announcements targeted at all members
drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select using (status = 'active' and target_role = 'all');

-- Achievements: Private to player unless explicitly is_public = true
drop policy if exists "achievements_public_read" on public.achievements;
drop policy if exists "achievements_owner_read" on public.achievements;

create policy "achievements_owner_read" on public.achievements
  for select using (
    auth.uid() is not null and player_id in (select id from public.players where user_uid = auth.uid())
  );

create policy "achievements_public_read" on public.achievements
  for select using (is_public = true);

-- 8. Coach Groups: Coach scoped read
drop policy if exists "coach_groups_coach_read" on public.coach_groups;
create policy "coach_groups_coach_read" on public.coach_groups
  for select using (
    auth.uid() is not null and coach_id in (select id from public.coaches where user_uid = auth.uid())
  );

-- 9. App User Profiles: Owner read/update
drop policy if exists "app_user_profiles_owner_read" on public.app_user_profiles;
create policy "app_user_profiles_owner_read" on public.app_user_profiles
  for select using (auth.uid() is not null and (auth.uid() = user_id::text or auth.uid() = (select p.user_uid from public.players p where p.user_uid = auth.uid())));
