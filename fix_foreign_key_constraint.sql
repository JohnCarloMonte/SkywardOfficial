-- Fix the foreign key constraint error for bookings table

-- Step 1: Check what cars exist in the cars table
SELECT id, name FROM public.cars LIMIT 5;

-- Step 2: Check what car_ids are being used in bookings
SELECT DISTINCT car_id FROM public.bookings WHERE car_id IS NOT NULL;

-- Step 3: Drop the existing foreign key constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS booking_car_id_fkey;

-- Step 4: Add the correct foreign key constraint referencing the cars table
ALTER TABLE public.bookings 
ADD CONSTRAINT booking_car_id_fkey 
FOREIGN KEY (car_id) REFERENCES public.car(id) ON DELETE CASCADE;

-- Step 5: Enable RLS if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for bookings table
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (true);
