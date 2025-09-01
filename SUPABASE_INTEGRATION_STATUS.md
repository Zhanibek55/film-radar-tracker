# 🔗 Статус интеграции с Supabase

## 📊 Общий статус: ⚠️ ЧАСТИЧНО ГОТОВО

### ✅ **Что работает отлично:**

1. **🔌 Подключение к Supabase**
   - ✅ URL: `https://phqnhkncdqjyuihgrigf.supabase.co`
   - ✅ Anon Key: работает для чтения/записи
   - ✅ Service Role Key: предоставлен и валиден
   - ✅ Базовые операции CRUD работают

2. **🗃️ Базовая структура БД**
   - ✅ Таблица `movies` существует и доступна
   - ✅ Таблица `episodes` существует и доступна
   - ✅ Базовые поля: id, title, year, imdb_rating, description, etc.
   - ✅ RLS (Row Level Security) настроен корректно

3. **⚡ Edge Function `parse-movies`**
   - ✅ Функция развернута и работает
   - ✅ Отвечает на запросы и обрабатывает данные
   - ✅ Может добавлять фильмы и эпизоды в БД
   - ✅ Возвращает статистику: 92 фильма, 84 эпизода обработано

4. **🎨 Фронтенд интеграция**
   - ✅ React Query работает с Supabase
   - ✅ TypeScript типы обновлены
   - ✅ Компоненты готовы к новым полям

### ❌ **Что требует доработки:**

1. **🔧 TMDB поля в БД**
   - ❌ Поля `tmdb_id`, `poster_tmdb_url`, `backdrop_url` отсутствуют
   - ❌ Поля `torrent_release_date`, `source_quality_score` отсутствуют  
   - ❌ Поля `genres`, `runtime`, `popularity` отсутствуют
   - ❌ Функции `calculate_quality_score`, `is_fresh_release` не созданы

2. **📋 Причина проблемы:**
   - PostgREST не поддерживает DDL операции через REST API
   - Даже Service Role не может выполнять ALTER TABLE через клиент
   - Требуется прямой доступ к PostgreSQL или Dashboard

---

## 🛠️ Решение: Ручная миграция

### **Вариант 1: Supabase Dashboard (Рекомендуется)**

1. Перейти на https://supabase.com/dashboard
2. Открыть проект
3. Зайти в **SQL Editor**
4. Скопировать и выполнить содержимое файла `manual_migration.sql`

### **Вариант 2: Готовый SQL скрипт**

```sql
-- Добавить TMDB поля в таблицу movies
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS poster_tmdb_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS torrent_release_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS source_quality_score INTEGER DEFAULT 0;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS last_episode_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS runtime INTEGER;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS popularity DECIMAL(10,3);
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS vote_count INTEGER;

-- Добавить TMDB поля в таблицу episodes
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS still_path TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS vote_average DECIMAL(3,1);
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS runtime INTEGER;

-- Создать индексы для производительности
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_torrent_release_date ON public.movies(torrent_release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_source_quality_score ON public.movies(source_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_movies_last_episode_date ON public.movies(last_episode_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON public.movies(popularity DESC);

-- Создать функции для оценки качества и свежести
CREATE OR REPLACE FUNCTION public.calculate_quality_score(quality_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE UPPER(quality_text)
    WHEN '2160P.BLURAY' THEN RETURN 100;
    WHEN '2160P.WEB-DL' THEN RETURN 95;
    WHEN '1080P.BLURAY' THEN RETURN 85;
    WHEN '1080P.WEB-DL' THEN RETURN 80;
    WHEN '720P.WEB-DL' THEN RETURN 65;
    WHEN '720P.WEBRIP' THEN RETURN 60;
    WHEN '480P' THEN RETURN 40;
    WHEN 'CAMRIP' THEN RETURN 10;
    ELSE RETURN 50;
  END CASE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_fresh_release(
  release_date TIMESTAMP WITH TIME ZONE,
  content_type TEXT,
  days_threshold INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF days_threshold IS NULL THEN
    days_threshold := CASE content_type
      WHEN 'movie' THEN 7
      WHEN 'series' THEN 3
      ELSE 7
    END CASE;
  END IF;
  
  RETURN release_date >= (NOW() - INTERVAL '1 day' * days_threshold);
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 Проверка после миграции

После выполнения миграции можно протестировать:

```javascript
// Тест вставки с TMDB данными
const testMovie = {
  title: 'Test TMDB Movie',
  year: 2024,
  type: 'movie',
  tmdb_id: 12345,
  poster_tmdb_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
  source_quality_score: 85,
  torrent_release_date: new Date().toISOString()
};

const { data, error } = await supabase
  .from('movies')
  .insert(testMovie)
  .select()
  .single();
```

---

## 🚀 После успешной миграции

### **Что станет доступно:**

1. **🎨 Полнофункциональный UI**
   - Вкладка "Свежие" с реальной фильтрацией по датам
   - Вкладка "Качество" с оценкой торрентов
   - Реальные постеры из TMDB вместо placeholder'ов

2. **⚡ Улучшенный парсинг**
   - TMDB API интеграция для метаданных
   - Система оценки качества торрентов (0-100 баллов)
   - Отслеживание дат релизов для "свежести"

3. **📊 Аналитика**
   - Функции для определения свежести контента
   - View `fresh_quality_content` для оптимизированных запросов
   - Индексы для быстрой фильтрации

---

## 📋 Итоговый статус

| Компонент | Статус | Описание |
|-----------|--------|----------|
| 🔌 Подключение | ✅ Готово | Supabase клиент работает |
| 🗃️ Базовая БД | ✅ Готово | Таблицы movies/episodes доступны |
| ⚡ Edge Function | ✅ Готово | parse-movies развернута и работает |
| 🎨 Фронтенд | ✅ Готово | Компоненты обновлены под новые поля |
| 🔧 TMDB поля | ❌ Нужна миграция | Требует ручного выполнения SQL |
| 🧪 API интеграция | ✅ Готово | TMDB + YTS API протестированы |

**Финальный шаг**: Выполнить миграцию через Supabase Dashboard, и система будет полностью готова! 🎉