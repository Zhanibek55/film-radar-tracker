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

-- Add some initial movie data directly
INSERT INTO public.movies (title, year, imdb_rating, description, quality, type) VALUES
('Дюна: Часть вторая', 2024, 8.5, 'Эпическое продолжение космической саги', 'BluRay', 'movie'),
('Оппенгеймер', 2023, 8.4, 'Биографический фильм о создателе атомной бомбы', 'BluRay', 'movie'),
('Барби', 2023, 6.9, 'Комедийный фильм о знаменитой кукле', 'WEB-DL', 'movie'),
('Джон Уик 4', 2023, 7.7, 'Четвертая часть боевика с Киану Ривзом', 'BluRay', 'movie'),
('Человек-паук: Через вселенные', 2023, 8.7, 'Анимационный фильм о Человеке-пауке', 'WEB-DL', 'movie'),
('Медведь', 2024, 8.7, 'Популярный американский сериал', 'WEB-DL', 'series'),
('Дом дракона', 2024, 8.4, 'Приквел к Игре престолов', 'WEB-DL', 'series'),
('Одни из нас', 2023, 8.8, 'Постапокалиптический сериал', 'WEB-DL', 'series'),
('Среда', 2022, 8.1, 'Сериал о дочери семейки Аддамс', 'WEBRip', 'series'),
('Очень странные дела', 2022, 8.7, 'Научно-фантастический сериал', 'WEB-DL', 'series')
ON CONFLICT (title, year) DO NOTHING;