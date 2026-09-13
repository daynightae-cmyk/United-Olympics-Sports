-- United Olympics Sports — Migration 0007: covering foreign-key indexes.
--
-- Evidence: Supabase performance advisor reported missing covering FK indexes on
-- events.sport_id and payment_intents.subscription_id. announcements.branch_id and
-- events.branch_id are already covered by composite indexes from migration 0003
-- (idx_announcements_org_branch, idx_events_org_branch).
--
-- Unused-index warnings are intentionally NOT acted on: the database carries
-- little production traffic, so usage statistics are not mature enough to justify
-- removals. No index is dropped here.
--
-- Safety: CREATE INDEX IF NOT EXISTS only; no destructive DDL; additive only.
-- Rollback: drop index if exists <name> (indexes are non-structural).

create index if not exists idx_events_sport_id
  on public.events(sport_id);

create index if not exists idx_payment_intents_subscription_id
  on public.payment_intents(subscription_id);

create index if not exists idx_payment_intents_player_id
  on public.payment_intents(player_id);
