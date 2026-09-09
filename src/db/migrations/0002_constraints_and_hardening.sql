-- ==============================================================================
-- United Olympics Sports - Migration 0002
-- Hardened Domain Integrity Constraints & Defense-in-Depth
-- ==============================================================================

-- 1. Status Enumerations
alter table organizations drop constraint if exists chk_organizations_status;
alter table organizations add constraint chk_organizations_status check (status in ('active', 'suspended', 'archived'));

alter table countries drop constraint if exists chk_countries_status;
alter table countries add constraint chk_countries_status check (status in ('active', 'inactive'));

alter table branches drop constraint if exists chk_branches_status;
alter table branches add constraint chk_branches_status check (status in ('active', 'inactive'));

alter table sports drop constraint if exists chk_sports_status;
alter table sports add constraint chk_sports_status check (status in ('active', 'inactive'));

alter table programs drop constraint if exists chk_programs_status;
alter table programs add constraint chk_programs_status check (status in ('active', 'inactive', 'draft'));

alter table groups drop constraint if exists chk_groups_status;
alter table groups add constraint chk_groups_status check (status in ('active', 'inactive', 'archived'));

alter table sessions drop constraint if exists chk_sessions_status;
alter table sessions add constraint chk_sessions_status check (status in ('scheduled', 'in_progress', 'completed', 'cancelled'));

alter table attendance drop constraint if exists chk_attendance_status;
alter table attendance add constraint chk_attendance_status check (status in ('present', 'absent', 'late', 'excused'));

alter table subscriptions drop constraint if exists chk_subscriptions_status;
alter table subscriptions add constraint chk_subscriptions_status check (status in ('pending', 'active', 'paused', 'cancelled', 'expired'));

alter table payments drop constraint if exists chk_payments_status;
alter table payments add constraint chk_payments_status check (status in ('pending', 'succeeded', 'failed', 'refunded'));

alter table public_enquiries drop constraint if exists chk_public_enquiries_status;
alter table public_enquiries add constraint chk_public_enquiries_status check (status in ('new', 'in_progress', 'responded', 'closed'));

alter table service_requests drop constraint if exists chk_service_requests_status;
alter table service_requests add constraint chk_service_requests_status check (status in ('requested', 'quoted', 'approved', 'rejected', 'fulfilled'));

alter table catalog_products drop constraint if exists chk_catalog_products_status;
alter table catalog_products add constraint chk_catalog_products_status check (status in ('draft', 'active', 'archived'));

alter table documents drop constraint if exists chk_documents_status;
alter table documents add constraint chk_documents_status check (status in ('active', 'archived'));

-- 2. Non-Negative Financial and Inventory Constraints
alter table subscriptions drop constraint if exists chk_subscriptions_amount;
alter table subscriptions add constraint chk_subscriptions_amount check (amount_minor is null or amount_minor >= 0);

alter table payments drop constraint if exists chk_payments_amount;
alter table payments add constraint chk_payments_amount check (amount_minor is null or amount_minor >= 0);

alter table service_requests drop constraint if exists chk_service_requests_amount;
alter table service_requests add constraint chk_service_requests_amount check (quoted_amount_minor is null or quoted_amount_minor >= 0);

alter table catalog_products drop constraint if exists chk_catalog_products_price;
alter table catalog_products add constraint chk_catalog_products_price check (price_minor is null or price_minor >= 0);

alter table inventory drop constraint if exists chk_inventory_quantity;
alter table inventory add constraint chk_inventory_quantity check (available_quantity >= 0);

-- 3. Temporal Constraints (ends_at >= starts_at)
alter table sessions drop constraint if exists chk_sessions_temporal;
alter table sessions add constraint chk_sessions_temporal check (ends_at is null or ends_at >= starts_at);

alter table subscriptions drop constraint if exists chk_subscriptions_temporal;
alter table subscriptions add constraint chk_subscriptions_temporal check (ends_at is null or starts_at is null or ends_at >= starts_at);

-- 4. Metric Bounds
alter table performance_evaluations drop constraint if exists chk_evaluations_score;
alter table performance_evaluations add constraint chk_evaluations_score check (score is null or (score >= 0 and score <= 100));

-- 5. Currencies
alter table subscriptions drop constraint if exists chk_subscriptions_currency;
alter table subscriptions add constraint chk_subscriptions_currency check (currency is null or currency in ('AED', 'SAR', 'USD', 'EUR', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR'));

alter table payments drop constraint if exists chk_payments_currency;
alter table payments add constraint chk_payments_currency check (currency is null or currency in ('AED', 'SAR', 'USD', 'EUR', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR'));

alter table service_requests drop constraint if exists chk_service_requests_currency;
alter table service_requests add constraint chk_service_requests_currency check (currency is null or currency in ('AED', 'SAR', 'USD', 'EUR', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR'));

alter table catalog_products drop constraint if exists chk_catalog_products_currency;
alter table catalog_products add constraint chk_catalog_products_currency check (currency is null or currency in ('AED', 'SAR', 'USD', 'EUR', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR'));

-- 6. Logical Active Subscription Uniqueness
create unique index if not exists unique_active_player_program_subscription
  on subscriptions (player_id, program_id)
  where status = 'active';

-- 7. Provider Transaction Reference Uniqueness
create unique index if not exists unique_provider_transaction_ref
  on payments (provider, provider_reference)
  where provider_reference is not null;
