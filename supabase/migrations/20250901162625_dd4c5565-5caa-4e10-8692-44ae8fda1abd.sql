-- Create extensions schema and move extensions there to fix security warning
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop existing extensions from public schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Recreate extensions in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Recreate the cron job with the correct schema reference
SELECT extensions.cron.schedule(
  'parse-movies-hourly',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    extensions.http_post(
        url:='https://phqnhkncdqjyuihgrigf.supabase.co/functions/v1/parse-movies',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDMyNTUsImV4cCI6MjA3MjMxOTI1NX0.0k7HRX_oTM9MJ7iOpOU9El3FYjFkOLapZPLM7yO4_4U"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);