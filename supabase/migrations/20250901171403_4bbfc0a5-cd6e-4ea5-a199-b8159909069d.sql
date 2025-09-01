-- Clear duplicate movies to start fresh
DELETE FROM public.movies WHERE title IN (
  SELECT title 
  FROM public.movies 
  GROUP BY title, year 
  HAVING COUNT(*) > 1
);

-- Also clear all old entries to start with fresh torrent data
DELETE FROM public.episodes;
DELETE FROM public.movies;