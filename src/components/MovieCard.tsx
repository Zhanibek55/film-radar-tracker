import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Film, Tv, Zap } from "lucide-react";
import { ImdbIcon } from "./ImdbIcon";
import moviePlaceholder from "@/assets/movie-placeholder.jpg";

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

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const getQualityColor = (quality?: string) => {
    switch (quality?.toUpperCase()) {
      case '4K':
        return 'bg-quality-4k text-background';
      case 'BLURAY':
        return 'bg-quality-4k text-background';
      case 'HD':
        return 'bg-quality-hd text-background';
      case 'WEB-DL':
        return 'bg-quality-hd text-background';
      case 'NF.WEB-DL':
        return 'bg-quality-hd text-background';
      case 'WEBRIP':
        return 'bg-amber-600 text-background';
      case 'BDRIP':
        return 'bg-blue-600 text-background';
      case 'CAMRIP':
        return 'bg-red-600 text-background';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLatestEpisode = () => {
    if (!movie.episodes || movie.episodes.length === 0) return null;
    
    return movie.episodes.reduce((latest, episode) => {
      const currentSeasonEp = episode.season_number * 1000 + episode.episode_number;
      const latestSeasonEp = latest.season_number * 1000 + latest.episode_number;
      return currentSeasonEp > latestSeasonEp ? episode : latest;
    });
  };

  const latestEpisode = getLatestEpisode();
  
  // Check if content is fresh
  const isFresh = () => {
    const now = new Date();
    if (movie.type === 'movie' && movie.torrent_release_date) {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(movie.torrent_release_date) > sevenDaysAgo;
    }
    if (movie.type === 'series' && movie.last_episode_date) {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      return new Date(movie.last_episode_date) > threeDaysAgo;
    }
    return false;
  };

  return (
    <Card className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-hover cursor-pointer">
      {/* Poster Image - Made smaller */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cinema-card">
        <img
          src={movie.poster_tmdb_url || movie.poster_url || moviePlaceholder}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = moviePlaceholder;
          }}
        />
        
        {/* Quality Badge - Made smaller */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {movie.quality && (
            <Badge 
              className={`${getQualityColor(movie.quality)} font-bold text-xs px-1.5 py-0.5 shadow-lg`}
            >
              {movie.quality}
            </Badge>
          )}
          {isFresh() && (
            <Badge 
              className="bg-green-600 text-white font-bold text-xs px-1.5 py-0.5 shadow-lg flex items-center gap-1"
            >
              <Zap className="w-2 h-2" />
              НОВОЕ
            </Badge>
          )}
        </div>

        {/* Type Icon - Made smaller */}
        <div className="absolute top-1.5 right-1.5 bg-background/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
          {movie.type === 'series' ? (
            <Tv className="w-2.5 h-2.5 text-foreground" />
          ) : (
            <Film className="w-2.5 h-2.5 text-foreground" />
          )}
        </div>

        {/* Rating Overlay - Kept prominent but more compact */}
        {movie.imdb_rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rating-bg via-rating-bg/80 to-transparent p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ImdbIcon className="w-6 h-3 drop-shadow-lg" />
              <span className="text-rating-gold font-bold text-base drop-shadow-lg">
                {movie.imdb_rating}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Made even more compact */}
      <div className="p-2 space-y-1.5">
        {/* Title and Year - More compact */}
        <div className="space-y-0.5">
          <h3 className="font-semibold text-foreground text-xs line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-muted-foreground text-xs opacity-75">
              {movie.year}
            </p>
          )}
        </div>

        {/* Series Episode Info - More compact */}
        {movie.type === 'series' && latestEpisode && (
          <div className="flex items-center gap-1 text-xs text-accent font-medium bg-accent/10 rounded px-1.5 py-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-xs">
              S{latestEpisode.season_number}E{latestEpisode.episode_number}
            </span>
          </div>
        )}

        {/* Description - Shorter */}
        {movie.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 leading-tight opacity-75">
            {movie.description}
          </p>
        )}
      </div>
    </Card>
  );
};