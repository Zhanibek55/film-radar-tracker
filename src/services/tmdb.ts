const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  popularity: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  popularity: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private apiKey: string;
  private baseUrl: string;
  private imageBaseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
    this.imageBaseUrl = TMDB_IMAGE_BASE_URL;

    if (!this.apiKey) {
      console.warn('TMDB API key not found. Please set VITE_TMDB_API_KEY in your environment variables.');
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('TMDB API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for movies by title
   */
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest<TMDBSearchResponse>(`/search/movie?query=${encodedQuery}&page=${page}`);
  }

  /**
   * Search for TV shows by title
   */
  async searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest<TMDBSearchResponse>(`/search/tv?query=${encodedQuery}&page=${page}`);
  }

  /**
   * Search for both movies and TV shows
   */
  async searchMulti(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest<TMDBSearchResponse>(`/search/multi?query=${encodedQuery}&page=${page}`);
  }

  /**
   * Get movie details by ID
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.makeRequest<TMDBMovie>(`/movie/${movieId}`);
  }

  /**
   * Get TV show details by ID
   */
  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    return this.makeRequest<TMDBTVShow>(`/tv/${tvId}`);
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResponse> {
    return this.makeRequest<TMDBSearchResponse>(`/movie/popular?page=${page}`);
  }

  /**
   * Get popular TV shows
   */
  async getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse> {
    return this.makeRequest<TMDBSearchResponse>(`/tv/popular?page=${page}`);
  }

  /**
   * Get trending movies and TV shows
   */
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse> {
    return this.makeRequest<TMDBSearchResponse>(`/trending/${mediaType}/${timeWindow}`);
  }

  /**
   * Get full poster URL from poster path
   */
  getPosterUrl(posterPath: string | null, size: string = 'w500'): string | null {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  /**
   * Get full backdrop URL from backdrop path
   */
  getBackdropUrl(backdropPath: string | null, size: string = 'w1280'): string | null {
    if (!backdropPath) return null;
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
  }

  /**
   * Enhanced search that tries to find the best match for a movie/show title
   */
  async findBestMatch(title: string, year?: number, type?: 'movie' | 'tv'): Promise<TMDBMovie | TMDBTVShow | null> {
    try {
      // First try exact search
      const searchResults = type === 'movie' 
        ? await this.searchMovies(title)
        : type === 'tv' 
        ? await this.searchTVShows(title)
        : await this.searchMulti(title);

      if (searchResults.results.length === 0) {
        return null;
      }

      // If year is provided, try to find a match with the same year
      if (year) {
        const yearMatches = searchResults.results.filter(item => {
          const itemYear = 'release_date' in item 
            ? parseInt(item.release_date?.split('-')[0] || '0')
            : parseInt(item.first_air_date?.split('-')[0] || '0');
          return Math.abs(itemYear - year) <= 1; // Allow 1 year difference
        });

        if (yearMatches.length > 0) {
          return yearMatches[0] as TMDBMovie | TMDBTVShow;
        }
      }

      // Return the first (most popular) result
      return searchResults.results[0] as TMDBMovie | TMDBTVShow;
    } catch (error) {
      console.error(`Error finding best match for "${title}":`, error);
      return null;
    }
  }

  /**
   * Enrich movie data with TMDB information
   */
  async enrichMovieData(title: string, year?: number, type?: 'movie' | 'series') {
    try {
      const tmdbType = type === 'series' ? 'tv' : 'movie';
      const match = await this.findBestMatch(title, year, tmdbType);

      if (!match) {
        return null;
      }

      const isMovie = 'release_date' in match;
      
      return {
        tmdb_id: match.id,
        title: isMovie ? match.title : match.name,
        original_title: isMovie ? match.original_title : match.original_name,
        description: match.overview,
        poster_url: this.getPosterUrl(match.poster_path),
        backdrop_url: this.getBackdropUrl(match.backdrop_path),
        release_date: isMovie ? match.release_date : match.first_air_date,
        imdb_rating: match.vote_average,
        vote_count: match.vote_count,
        popularity: match.popularity,
        genre_ids: match.genre_ids
      };
    } catch (error) {
      console.error(`Error enriching movie data for "${title}":`, error);
      return null;
    }
  }
}

export const tmdbService = new TMDBService();
export default tmdbService;