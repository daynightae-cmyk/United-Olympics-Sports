-- ==============================================================================
-- United Olympics Sports - Migration 0003
-- Portal, Operational Workflows, Notifications & Payments Tables
-- ==============================================================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_uid text not null,
  channel text not null default 'in_app',
  status text not null default 'queued',
  template text,
  locale text not null default 'ar',
  title text not null,
  title_ar text,
  body text not null,
  body_ar text,
  provider_reference text,
  attempt_count integer not null default 0,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  dispatched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table notifications drop constraint if exists chk_notifications_status;
alter table notifications add constraint chk_notifications_status check (status in ('queued', 'sending', 'sent', 'delivered', 'failed'));

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  badge text,
  category text not null default 'general',
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  branch_id uuid references branches(id),
  sport_id uuid references sports.id,
  title text not null,
  title_ar text,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  branch_id uuid references branches(id),
  title text not null,
  title_ar text,
  body text not null,
  body_ar text,
  target_role text not null default 'all',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_uid text not null,
  recipient_uid text not null,
  thread_id text not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  player_id uuid references players(id),
  subscription_id uuid references subscriptions(id),
  amount_minor integer not null,
  currency text not null default 'AED',
  status text not null default 'requires_payment_method',
  provider text not null default 'stripe',
  provider_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payment_intents drop constraint if exists chk_payment_intents_amount;
alter table payment_intents add constraint chk_payment_intents_amount check (amount_minor >= 0);

create table if not exists payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  provider text not null,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_uid text not null,
  status text not null default 'pending',
  total_minor integer not null,
  currency text not null default 'AED',
  items jsonb not null,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders drop constraint if exists chk_orders_total;
alter table orders add constraint chk_orders_total check (total_minor >= 0);
