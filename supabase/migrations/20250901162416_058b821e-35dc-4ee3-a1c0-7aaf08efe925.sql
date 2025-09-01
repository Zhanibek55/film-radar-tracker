-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run movie parsing every hour
SELECT cron.schedule(
  'parse-movies-hourly',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://phqnhkncdqjyuihgrigf.supabase.co/functions/v1/parse-movies',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDMyNTUsImV4cCI6MjA3MjMxOTI1NX0.0k7HRX_oTM9MJ7iOpOU9El3FYjFkOLapZPLM7yO4_4U"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Update movie data with more quality types and better sample data
UPDATE public.movies SET quality = 'BDRip' WHERE title = 'Oppenheimer';
UPDATE public.movies SET quality = 'WEBRip' WHERE title = 'The Bear';

-- Insert more sample movies with different quality types
INSERT INTO public.movies (title, year, imdb_rating, description, type, quality) VALUES
('John Wick: Chapter 4', 2023, 7.7, 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy.', 'movie', 'CAMRip'),
('House of the Dragon', 2022, 8.4, 'An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.', 'series', 'WEB-DL'),
('Top Gun: Maverick', 2022, 8.2, 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past.', 'movie', 'BluRay'),
('Stranger Things', 2016, 8.7, 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.', 'series', 'NF.WEB-DL')
ON CONFLICT DO NOTHING;