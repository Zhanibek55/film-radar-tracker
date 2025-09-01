-- Add TMDB integration fields to movies table
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS poster_tmdb_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS torrent_release_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS source_quality_score INTEGER DEFAULT 0;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS last_episode_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS runtime INTEGER;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS status TEXT; -- 'Released', 'In Production', etc.
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS popularity DECIMAL(10,3);
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS vote_count INTEGER;

-- Add TMDB integration fields to episodes table  
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS still_path TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS vote_average DECIMAL(3,1);
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS runtime INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_torrent_release_date ON public.movies(torrent_release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_source_quality_score ON public.movies(source_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_movies_last_episode_date ON public.movies(last_episode_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON public.movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_tmdb_id ON public.episodes(tmdb_id);

-- Add constraint for unique TMDB ID per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_movies_tmdb_type_unique ON public.movies(tmdb_id, type) WHERE tmdb_id IS NOT NULL;

-- Update quality scoring function
CREATE OR REPLACE FUNCTION public.calculate_quality_score(quality_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE UPPER(quality_text)
    WHEN '2160P.BLURAY' THEN RETURN 100;
    WHEN '2160P.WEB-DL' THEN RETURN 95;
    WHEN '2160P.WEBRIP' THEN RETURN 90;
    WHEN '1080P.BLURAY' THEN RETURN 85;
    WHEN '1080P.WEB-DL' THEN RETURN 80;
    WHEN '1080P.WEBRIP' THEN RETURN 75;
    WHEN '720P.BLURAY' THEN RETURN 70;
    WHEN '720P.WEB-DL' THEN RETURN 65;
    WHEN '720P.WEBRIP' THEN RETURN 60;
    WHEN '480P' THEN RETURN 40;
    WHEN 'CAMRIP' THEN RETURN 10;
    ELSE RETURN 50;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if content is "fresh"
CREATE OR REPLACE FUNCTION public.is_fresh_release(
  release_date TIMESTAMP WITH TIME ZONE,
  content_type TEXT,
  days_threshold INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF days_threshold IS NULL THEN
    days_threshold := CASE content_type
      WHEN 'movie' THEN 7    -- Movies are fresh for 7 days
      WHEN 'series' THEN 3   -- Series episodes are fresh for 3 days
      ELSE 7
    END CASE;
  END IF;
  
  RETURN release_date >= (NOW() - INTERVAL '1 day' * days_threshold);
END;
$$ LANGUAGE plpgsql;

-- Create view for fresh high-quality content
CREATE OR REPLACE VIEW public.fresh_quality_content AS
SELECT 
  m.*,
  public.calculate_quality_score(m.quality) as calculated_quality_score,
  public.is_fresh_release(m.torrent_release_date, m.type) as is_fresh,
  CASE 
    WHEN m.type = 'series' AND m.last_episode_date IS NOT NULL 
    THEN public.is_fresh_release(m.last_episode_date, 'series')
    ELSE public.is_fresh_release(m.torrent_release_date, m.type)
  END as is_content_fresh
FROM public.movies m
WHERE 
  (m.torrent_release_date IS NOT NULL OR m.last_episode_date IS NOT NULL)
  AND public.calculate_quality_score(m.quality) >= 60  -- At least 720p
  AND (m.imdb_rating IS NULL OR m.imdb_rating >= 6.0)
ORDER BY 
  COALESCE(m.last_episode_date, m.torrent_release_date) DESC,
  m.popularity DESC NULLS LAST,
  m.imdb_rating DESC NULLS LAST;

-- Grant permissions
GRANT SELECT ON public.fresh_quality_content TO anon;
GRANT SELECT ON public.fresh_quality_content TO authenticated;

COMMENT ON TABLE public.movies IS 'Movies and TV series with TMDB integration and torrent tracking';
COMMENT ON COLUMN public.movies.tmdb_id IS 'The Movie Database ID for fetching additional metadata';
COMMENT ON COLUMN public.movies.torrent_release_date IS 'When the torrent was first released (more important than movie release date)';
COMMENT ON COLUMN public.movies.source_quality_score IS 'Calculated quality score based on torrent quality (0-100)';
COMMENT ON COLUMN public.movies.last_episode_date IS 'For series: when the latest episode was released';
COMMENT ON VIEW public.fresh_quality_content IS 'View showing only fresh, high-quality releases suitable for homepage';