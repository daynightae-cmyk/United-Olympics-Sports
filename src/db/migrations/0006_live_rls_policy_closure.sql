-- ==============================================================================
-- United Olympics Sports - Migration 0006
-- Live RLS Policy Closure, Sensitive Table Isolation & Scoped Security
-- ==============================================================================

-- 1. Schema Parity: app_user_profiles table (table 33)
create table if not exists app_user_profiles (
  user_id uuid primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table app_user_profiles enable row level security;

-- 2. Schema Parity: Add is_public flag to achievements for safe public scoping
alter table achievements add column if not exists is_public boolean not null default false;
create index if not exists idx_achievements_public on achievements(is_public) where is_public = true;

-- 3. Enable RLS on all 33 base tables (defense-in-depth)
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

-- 4. Revoke anonymous access on sensitive tables (safe idempotency without role re-definition)
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.payment_webhooks from anon;
    revoke all on public.payment_intents from anon;
    revoke all on public.orders from anon;
    revoke all on public.messages from anon;
    revoke all on public.notifications from anon;
  end if;
end $$;

-- 5. Strict RLS Policies for Sensitive Tables (No anonymous read, text UID typed)
-- Notifications: Recipient scoped
drop policy if exists "notifications_recipient_read" on public.notifications;
create policy "notifications_recipient_read" on public.notifications
  for select using (auth.uid() is not null and recipient_uid = auth.uid()::text);

-- Messages: Participant scoped
drop policy if exists "messages_participant_read" on public.messages;
create policy "messages_participant_read" on public.messages
  for select using (auth.uid() is not null and (sender_uid = auth.uid()::text or recipient_uid = auth.uid()::text));

-- Orders: Customer scoped
drop policy if exists "orders_customer_read" on public.orders;
create policy "orders_customer_read" on public.orders
  for select using (auth.uid() is not null and customer_uid = auth.uid()::text);

-- Payment Intents: Player / Owner scoped
drop policy if exists "payment_intents_owner_read" on public.payment_intents;
create policy "payment_intents_owner_read" on public.payment_intents
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.players where players.id = payment_intents.player_id and players.user_uid = auth.uid()::text
    )
  );

-- Payment Webhooks: SERVER_ONLY (zero client policies, fail-closed deny all)
drop policy if exists "payment_webhooks_anon_read" on public.payment_webhooks;
drop policy if exists "payment_webhooks_authenticated_read" on public.payment_webhooks;

-- 6. Player Scoped Access Model (NO global authenticated read)
drop policy if exists "players_authenticated_read" on public.players;
drop policy if exists "players_self_read" on public.players;
drop policy if exists "players_guardian_read" on public.players;
drop policy if exists "players_coach_read" on public.players;

-- Player Self Read
create policy "players_self_read" on public.players
  for select using (auth.uid() is not null and user_uid = auth.uid()::text);

-- Guardian Read: Only linked players through active player_guardians
create policy "players_guardian_read" on public.players
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.player_guardians pg
      join public.guardians g on g.id = pg.guardian_id
      where pg.player_id = players.id
        and g.user_uid = auth.uid()::text
        and pg.active = true
    )
  );

-- Coach Read: Only players assigned to the coach's active groups
create policy "players_coach_read" on public.players
  for select using (
    auth.uid() is not null
    and players.group_id is not null
    and exists (
      select 1 from public.coach_groups cg
      join public.coaches c on c.id = cg.coach_id
      where cg.group_id = players.group_id
        and c.user_uid = auth.uid()::text
        and cg.active = true
    )
  );

-- 7. Guardian & Coach Identity Access
drop policy if exists "guardians_self_read" on public.guardians;
create policy "guardians_self_read" on public.guardians
  for select using (auth.uid() is not null and user_uid = auth.uid()::text);

drop policy if exists "player_guardians_read" on public.player_guardians;
create policy "player_guardians_read" on public.player_guardians
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.guardians g
      where g.id = player_guardians.guardian_id
        and g.user_uid = auth.uid()::text
    )
  );

drop policy if exists "coaches_self_read" on public.coaches;
create policy "coaches_self_read" on public.coaches
  for select using (auth.uid() is not null and user_uid = auth.uid()::text);

-- 8. Coach Groups: Coach scoped read
drop policy if exists "coach_groups_coach_read" on public.coach_groups;
create policy "coach_groups_coach_read" on public.coach_groups
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.coaches c
      where c.id = coach_groups.coach_id
        and c.user_uid = auth.uid()::text
    )
  );

-- 9. App User Profiles: Owner UUID read/update
drop policy if exists "app_user_profiles_owner_read" on public.app_user_profiles;
create policy "app_user_profiles_owner_read" on public.app_user_profiles
  for select using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "app_user_profiles_owner_update" on public.app_user_profiles;
create policy "app_user_profiles_owner_update" on public.app_user_profiles
  for update using (auth.uid() is not null and user_id = auth.uid());

-- 10. Public Content Security
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (status in ('scheduled', 'published'));

drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select using (status = 'active' and target_role = 'all');

drop policy if exists "achievements_public_read" on public.achievements;
drop policy if exists "achievements_owner_read" on public.achievements;

create policy "achievements_owner_read" on public.achievements
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.players p where p.id = achievements.player_id and p.user_uid = auth.uid()::text
    )
  );

create policy "achievements_public_read" on public.achievements
  for select using (is_public = true);
