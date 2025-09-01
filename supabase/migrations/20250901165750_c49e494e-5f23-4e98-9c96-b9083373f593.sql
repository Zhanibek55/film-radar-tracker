-- Create function to automatically parse movies
CREATE OR REPLACE FUNCTION schedule_movie_parsing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by cron to trigger movie parsing
  PERFORM net.http_post(
    url := 'https://phqnhkncdqjyuihgrigf.supabase.co/functions/v1/parse-movies',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDMyNTUsImV4cCI6MjA3MjMxOTI1NX0.0k7HRX_oTM9MJ7iOpOU9El3FYjFkOLapZPLM7yO4_4U"}'::jsonb,
    body := '{"automated": true}'::jsonb
  );
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule movie parsing to run every 6 hours
SELECT cron.schedule(
  'parse-movies-automatically',
  '0 */6 * * *', -- every 6 hours
  'SELECT schedule_movie_parsing();'
);

-- Run initial parsing
SELECT schedule_movie_parsing();