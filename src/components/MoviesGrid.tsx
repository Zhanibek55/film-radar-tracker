import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Film, Tv, TrendingUp, Zap, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface Episode {
  season_number: number;
  episode_number: number;
  title?: string;
}

interface Movie {
  id: string;
  title: string;
  year?: number;
  imdb_rating?: number;
  description?: string;
  poster_url?: string;
  quality?: string;
  type: 'movie' | 'series';
  episodes?: Episode[];
  tmdb_id?: number;
  poster_tmdb_url?: string;
  backdrop_url?: string;
  torrent_release_date?: string;
  source_quality_score?: number;
  last_episode_date?: string;
  genres?: string[];
  runtime?: number;
  status?: string;
  original_language?: string;
  popularity?: number;
  vote_count?: number;
}

export const MoviesGrid = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fresh");
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: movies, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .order('torrent_release_date', { ascending: false, nullsLast: true })
        .order('last_episode_date', { ascending: false, nullsLast: true })
        .order('popularity', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: false });

      if (moviesError) throw moviesError;

      // Fetch episodes for series
      const moviesWithEpisodes = await Promise.all(
        moviesData.map(async (movie) => {
          if (movie.type === 'series') {
            const { data: episodes } = await supabase
              .from('episodes')
              .select('season_number, episode_number, title')
              .eq('movie_id', movie.id)
              .order('season_number', { ascending: false })
              .order('episode_number', { ascending: false });
            
            return { ...movie, episodes: episodes || [] };
          }
          return movie;
        })
      );

      return moviesWithEpisodes as Movie[];
    },
  });

  // Force trigger torrent parsing on component mount
  useEffect(() => {
    const forceTorrentParsing = async () => {
      setIsInitializing(true);
      console.log('Forcing torrent parsing...');
      
      try {
        const { data, error } = await supabase.functions.invoke('parse-movies', {
          body: { 
            source: 'torrents',
            force: true,
            timestamp: Date.now()
          }
        });
        
        if (error) {
          console.error('Torrent parsing error:', error);
          toast({
            title: "Ошибка парсинга",
            description: "Не удалось загрузить данные с торрент-сайтов",
            variant: "destructive",
          });
        } else {
          console.log('Torrent parsing completed:', data);
          toast({
            title: "Парсинг завершен",
            description: "Загружены свежие данные с торрент-сайтов",
          });
          // Force refetch after parsing
          setTimeout(() => {
            refetch();
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to trigger torrent parsing:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось запустить парсинг торрентов",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    forceTorrentParsing();
  }, [refetch, toast]);

  const handleRefresh = async () => {
    try {
      // Trigger fresh parsing
      console.log('Triggering fresh torrent parsing...');
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-movies', {
        body: { source: 'torrents', force: true }
      });
      
      if (parseError) {
        console.error('Parse error:', parseError);
      } else {
        console.log('Parse completed:', parseData);
        // Wait a moment then refresh
        setTimeout(async () => {
          await refetch();
          toast({
            title: "Обновлено",
            description: "Список фильмов обновлен через торрент-парсинг",
          });
        }, 2000);
        return;
      }
      
      // Fallback to regular refresh
      await refetch();
      toast({
        title: "Обновлено", 
        description: "Список фильмов и сериалов обновлен",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить список",
        variant: "destructive",
      });
    }
  };

  const filteredMovies = movies?.filter(movie => {
    switch (activeTab) {
      case "movies":
        return movie.type === "movie";
      case "series":
        return movie.type === "series";
      case "fresh": {
        // Fresh releases: torrent released within last 7 days OR new episodes within 3 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        const isFreshMovie = movie.type === 'movie' && 
          movie.torrent_release_date && 
          new Date(movie.torrent_release_date) > sevenDaysAgo;
          
        const isFreshSeries = movie.type === 'series' && 
          movie.last_episode_date && 
          new Date(movie.last_episode_date) > threeDaysAgo;
          
        return isFreshMovie || isFreshSeries;
      }
      case "quality":
        // High quality releases: score >= 80 (1080p+ WEB-DL/BluRay)
        return movie.source_quality_score && movie.source_quality_score >= 80;
      case "top":
        return movie.imdb_rating && movie.imdb_rating >= 8.0;
      default:
        return true;
    }
  }) || [];

  if (isLoading || isInitializing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            {isInitializing && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Загрузка торрентов...
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Film Radar
          </h1>
          <p className="text-muted-foreground">
            Отслеживание новых фильмов и сериалов в хорошем качестве
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          disabled={isFetching}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-cinema-card border-border">
          <TabsTrigger value="fresh" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Свежие
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Качество
          </TabsTrigger>
          <TabsTrigger value="movies" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Фильмы
          </TabsTrigger>
          <TabsTrigger value="series" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Сериалы
          </TabsTrigger>
          <TabsTrigger value="top" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Топ рейтинг
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Все
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {activeTab === "fresh" 
                  ? "Пока нет свежих релизов (последние 7 дней для фильмов, 3 дня для сериалов)"
                  : activeTab === "quality"
                  ? "Пока нет релизов в высоком качестве (1080p+ WEB-DL/BluRay)"
                  : activeTab === "top" 
                  ? "Пока нет фильмов с высоким рейтингом (8.0+)"
                  : "Пока нет контента в этой категории"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};