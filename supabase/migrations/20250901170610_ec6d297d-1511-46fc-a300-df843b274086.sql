-- Fix RLS policies to allow INSERT operations
CREATE POLICY "Allow insert for service role" 
ON public.movies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for service role" 
ON public.movies 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow insert for episodes" 
ON public.episodes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for episodes" 
ON public.episodes 
FOR UPDATE 
USING (true);