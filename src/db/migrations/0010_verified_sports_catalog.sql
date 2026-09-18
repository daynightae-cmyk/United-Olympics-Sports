-- United Olympics Sports — Migration 0010: verified sports reference catalog.
--
-- Seeds only the canonical sports catalog used across the public site and
-- production admin gateway. This is reference data, not operational/business
-- data: no branches, programs, groups, coaches, players, prices or schedules
-- are created here.
--
-- Idempotent: sports.code is unique and each row is upserted by code.
-- Rollback: set catalog rows inactive or remove them only after proving there
-- are no dependent production records. Do not cascade-delete live data.

insert into public.sports (code, name, name_ar, status)
values
  ('football', 'Football', 'كرة القدم', 'active'),
  ('swimming', 'Swimming', 'السباحة', 'active'),
  ('basketball', 'Basketball', 'كرة السلة', 'active'),
  ('tennis', 'Tennis', 'التنس', 'active'),
  ('gymnastics', 'Gymnastics', 'الجمباز', 'active'),
  ('martial-arts', 'Martial Arts', 'الفنون القتالية', 'active')
on conflict (code) do update
set
  name = excluded.name,
  name_ar = excluded.name_ar,
  status = excluded.status,
  updated_at = now();
