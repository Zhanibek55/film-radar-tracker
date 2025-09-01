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
        return 'bg-quality-4k';
      case 'HD':
        return 'bg-quality-hd';
      default:
        return 'bg-secondary';
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
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-cinema-card">
        <img
          src={movie.poster_url || moviePlaceholder}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = moviePlaceholder;
          }}
        />
        
        {/* Quality Badge */}
        {movie.quality && (
          <Badge 
            className={`absolute top-2 left-2 ${getQualityColor(movie.quality)} text-background font-semibold text-xs px-2 py-1`}
          >
            {movie.quality}
          </Badge>
        )}

        {/* Type Icon */}
        <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5">
          {movie.type === 'series' ? (
            <Tv className="w-4 h-4 text-foreground" />
          ) : (
            <Film className="w-4 h-4 text-foreground" />
          )}
        </div>

        {/* Rating Overlay */}
        {movie.imdb_rating && (
          <div className="absolute bottom-2 right-2 bg-rating-bg/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 fill-rating-gold text-rating-gold" />
            <span className="text-rating-gold font-semibold text-xs">
              {movie.imdb_rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Year */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-muted-foreground text-sm">
              {movie.year}
            </p>
          )}
        </div>

        {/* Series Episode Info */}
        {movie.type === 'series' && latestEpisode && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              S{latestEpisode.season_number}E{latestEpisode.episode_number}
              {latestEpisode.title && ` • ${latestEpisode.title}`}
            </span>
          </div>
        )}

        {/* Description */}
        {movie.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}
      </div>
    </Card>
  );
};