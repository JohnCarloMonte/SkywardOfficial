-- Migration: Fix bookings.car_id foreign key to reference `car(id)` instead of `cars(id)`
-- Run this in Supabase SQL editor or via psql/supabase CLI after taking a backup.

BEGIN;

-- Safety: if a constraint with this name exists, drop it. Adjust the name if your DB uses a different one.
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS booking_car_id_fkey;

-- Add new foreign key referencing the correct table `car`.
-- Choose ON DELETE behavior that matches your app (CASCADE/SET NULL/RESTRICT).
ALTER TABLE bookings
  ADD CONSTRAINT booking_car_id_fkey
  FOREIGN KEY (car_id) REFERENCES car(id) ON DELETE RESTRICT;

COMMIT;

-- Notes:
-- 1) If your constraint has a different name, find it with:
--    SELECT conname FROM pg_constraint WHERE conrelid = 'bookings'::regclass AND contype = 'f';
-- 2) If you prefer to set ON DELETE to SET NULL or CASCADE, change the clause above.
-- 3) Test in a staging DB first and ensure no orphaned rows exist that would break the new FK.
