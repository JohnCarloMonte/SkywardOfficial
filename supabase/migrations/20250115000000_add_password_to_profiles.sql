-- Add password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN password TEXT;

-- Update the updated_at trigger to include password changes
-- (The existing trigger will handle this automatically)
