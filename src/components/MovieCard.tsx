import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Film, Tv } from "lucide-react";
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

  return (
    <Card className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-hover cursor-pointer">
      {/* Poster Image - Made smaller */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cinema-card">
        <img
          src={movie.poster_url || moviePlaceholder}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = moviePlaceholder;
          }}
        />
        
        {/* Quality Badge - Made more prominent */}
        {movie.quality && (
          <Badge 
            className={`absolute top-2 left-2 ${getQualityColor(movie.quality)} font-bold text-xs px-2 py-1 shadow-lg`}
          >
            {movie.quality}
          </Badge>
        )}

        {/* Type Icon */}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
          {movie.type === 'series' ? (
            <Tv className="w-3 h-3 text-foreground" />
          ) : (
            <Film className="w-3 h-3 text-foreground" />
          )}
        </div>

        {/* Rating Overlay - Made much more prominent */}
        {movie.imdb_rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rating-bg via-rating-bg/80 to-transparent p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-4 h-4 fill-rating-gold text-rating-gold drop-shadow-lg" />
              <span className="text-rating-gold font-bold text-lg drop-shadow-lg">
                {movie.imdb_rating}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Made more compact */}
      <div className="p-3 space-y-2">
        {/* Title and Year */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-muted-foreground text-xs">
              {movie.year}
            </p>
          )}
        </div>

        {/* Series Episode Info */}
        {movie.type === 'series' && latestEpisode && (
          <div className="flex items-center gap-1.5 text-xs text-accent font-medium bg-accent/10 rounded px-2 py-1">
            <Clock className="w-3 h-3" />
            <span>
              S{latestEpisode.season_number}E{latestEpisode.episode_number}
            </span>
          </div>
        )}

        {/* Description - Made shorter */}
        {movie.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}
      </div>
    </Card>
  );
};