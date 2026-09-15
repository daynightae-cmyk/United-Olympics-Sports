-- United Olympics Sports — Migration 0008: store catalog richness.
--
-- Closes the production catalog mapping gap where the store gateway collapsed
-- every live product to category 'equipment' / type 'Club equipment' /
-- description = name because catalog_products carried no richer fields.
--
-- Additive only, idempotent, no destructive DDL, no data backfill invention:
-- existing rows keep NULL richness fields and the gateway falls back honestly.
-- Rollback: drop added columns/indexes if exists (structural no-op for empty use).
--
-- Safety: DO blocks with information_schema guards so re-runs and
-- partially-migrated databases converge without errors.
-- Index safety (review closure 2026-09-15): catalog_products is a known-small
-- store table (tens to low hundreds of rows). The three indexes below use
-- CREATE INDEX CONCURRENTLY so they do not block writes on a provisioned
-- production primary, and the migration runner executes this file outside an
-- explicit transaction when CONCURRENTLY is present (see src/db/migrate.ts).

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'description') then
    alter table public.catalog_products add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'description_ar') then
    alter table public.catalog_products add column description_ar text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'category') then
    alter table public.catalog_products add column category text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'sport') then
    alter table public.catalog_products add column sport text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'product_type') then
    alter table public.catalog_products add column product_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'product_type_ar') then
    alter table public.catalog_products add column product_type_ar text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'media_url') then
    alter table public.catalog_products add column media_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'catalog_products' and column_name = 'slug') then
    alter table public.catalog_products add column slug text;
  end if;
end $$;

-- Domain guardrails: known store category slugs plus NULL (unknown stays honest).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_catalog_products_category') then
    alter table public.catalog_products
      add constraint chk_catalog_products_category
      check (category is null or category in ('swimming','football','basketball','tennis','gymnastics','martial-arts','apparel','equipment','accessories'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'chk_catalog_products_sport') then
    alter table public.catalog_products
      add constraint chk_catalog_products_sport
      check (sport is null or sport in ('swimming','football','basketball','tennis','gymnastics','martial-arts'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'chk_catalog_products_slug') then
    alter table public.catalog_products
      add constraint chk_catalog_products_slug
      check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  end if;
end $$;

create unique index concurrently if not exists uq_catalog_products_slug
  on public.catalog_products(slug) where slug is not null;

create index concurrently if not exists idx_catalog_products_category
  on public.catalog_products(category) where status = 'active';

create index concurrently if not exists idx_catalog_products_sport
  on public.catalog_products(sport) where status = 'active';
