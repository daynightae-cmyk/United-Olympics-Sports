-- United Olympics Sports — Migration 0009: inventory anonymous read scoping.
--
-- Closes the anonymous over-exposure where "inventory_anon_read" (USING (true))
-- exposed per-product stock quantities for every inventory row, including rows
-- for draft/inactive products. Anonymous reads are now limited to inventory
-- rows whose product is published (catalog_products.status = 'active'),
-- mirroring the catalog_products_anon_read policy.
--
-- Server-side handlers already join inventory through the catalog read path and
-- service_role bypasses RLS, so authorized and server callers are unaffected.
--
-- Idempotent: drops the old policy when present, then creates the scoped one.
-- Rollback (not recommended): drop policy "inventory_anon_read" on
-- public.inventory and re-create it with USING (true).

do $$
begin
  if exists (select 1 from pg_policies where policyname = 'inventory_anon_read' and tablename = 'inventory') then
    drop policy "inventory_anon_read" on public.inventory;
  end if;

  create policy "inventory_anon_read" on public.inventory for select using (
    exists (
      select 1
        from public.catalog_products p
       where p.id = inventory.product_id
         and p.status = 'active'
    )
  );
end $$;
