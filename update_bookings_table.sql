-- Update your existing bookings table to fix foreign key and add RLS policies

-- First, drop the existing foreign key constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS booking_car_id_fkey;

-- Add the correct foreign key constraint referencing the cars table
ALTER TABLE public.bookings 
ADD CONSTRAINT booking_car_id_fkey 
FOREIGN KEY (car_id) REFERENCES public.car(id) ON DELETE CASCADE;

-- Make email field NOT NULL (optional - only if you want to enforce it)
-- ALTER TABLE public.bookings ALTER COLUMN email SET NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
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

-- Optional: Create policy for delete operations
CREATE POLICY "Anyone can delete bookings" 
ON public.bookings 
FOR DELETE 
USING (true);
