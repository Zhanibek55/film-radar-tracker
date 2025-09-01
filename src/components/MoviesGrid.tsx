import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Film, Tv, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
}

export const MoviesGrid = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: movies, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
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

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Обновлено",
        description: "Список фильмов и сериалов обновлен",
      });
    } catch (error) {
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
      case "top":
        return movie.imdb_rating && movie.imdb_rating >= 8.0;
      default:
        return true;
    }
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Все
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
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {activeTab === "top" 
                  ? "Пока нет фильмов с высоким рейтингом"
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