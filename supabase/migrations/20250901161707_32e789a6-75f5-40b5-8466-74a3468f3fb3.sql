-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  imdb_rating DECIMAL(3,1),
  description TEXT,
  poster_url TEXT,
  quality TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create series episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT,
  air_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movie_id, season_number, episode_number)
);

-- Enable Row Level Security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Movies are viewable by everyone" 
ON public.movies 
FOR SELECT 
USING (true);

CREATE POLICY "Episodes are viewable by everyone" 
ON public.episodes 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_movies_type ON public.movies(type);
CREATE INDEX idx_movies_imdb_rating ON public.movies(imdb_rating DESC);
CREATE INDEX idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX idx_episodes_movie_id ON public.episodes(movie_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.movies (title, year, imdb_rating, description, type, quality) VALUES
('Oppenheimer', 2023, 8.4, 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', 'movie', 'HD'),
('The Bear', 2022, 8.7, 'A young chef from the fine dining world returns to Chicago to run his deceased brother''s sandwich shop.', 'series', 'HD'),
('Wednesday', 2022, 8.1, 'Follows Wednesday Addams'' years as a student at Nevermore Academy.', 'series', 'HD');

-- Insert sample episodes for series
INSERT INTO public.episodes (movie_id, season_number, episode_number, title) 
SELECT id, 1, 1, 'Pilot' FROM public.movies WHERE title = 'The Bear';

INSERT INTO public.episodes (movie_id, season_number, episode_number, title) 
SELECT id, 1, 2, 'Hands' FROM public.movies WHERE title = 'The Bear';