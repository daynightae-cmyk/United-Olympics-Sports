-- ==============================================================================
-- United Olympics Sports - Migration 0005
-- Production Schema Parity & Comprehensive RLS Hardening
-- ==============================================================================

-- 1. Enable RLS on all foundation domain tables (matches verified live Supabase catalog)
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

-- 2. Public / Anonymous policies where explicitly permitted
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'public_enquiries_anon_insert' and tablename = 'public_enquiries') then
    create policy "public_enquiries_anon_insert" on public.public_enquiries for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'catalog_products_anon_read' and tablename = 'catalog_products') then
    create policy "catalog_products_anon_read" on public.catalog_products for select using (status = 'active');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'inventory_anon_read' and tablename = 'inventory') then
    create policy "inventory_anon_read" on public.inventory for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'achievements_public_read' and tablename = 'achievements') then
    create policy "achievements_public_read" on public.achievements for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'events_public_read' and tablename = 'events') then
    create policy "events_public_read" on public.events for select using (status = 'scheduled');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'announcements_public_read' and tablename = 'announcements') then
    create policy "announcements_public_read" on public.announcements for select using (status = 'active');
  end if;
end $$;

-- 3. Additional performance and lookup indices
create index if not exists idx_players_branch_id on players(branch_id);
create index if not exists idx_sessions_starts_at on sessions(starts_at desc);
create index if not exists idx_attendance_player on attendance(player_id);
create index if not exists idx_perf_eval_player on performance_evaluations(player_id);
create index if not exists idx_subscriptions_player on subscriptions(player_id);
create index if not exists idx_payments_subscription on payments(subscription_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_actor on audit_logs(actor_uid, created_at desc);
