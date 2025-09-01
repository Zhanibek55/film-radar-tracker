import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tmdbService } from '@/services/tmdb';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export const TMDBTest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await tmdbService.searchMulti(searchTerm);
      setResults(response.results.slice(0, 6)); // Show first 6 results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">TMDB API Test</h2>
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for movies or TV shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-[3/4] bg-muted">
              {item.poster_path ? (
                <img
                  src={tmdbService.getPosterUrl(item.poster_path) || ''}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-sm line-clamp-2">
                {item.title || item.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.title ? 'Movie' : 'TV Show'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ⭐ {item.vote_average.toFixed(1)}
                </Badge>
              </div>
              
              {(item.release_date || item.first_air_date) && (
                <p className="text-xs text-muted-foreground">
                  {(item.release_date || item.first_air_date)?.split('-')[0]}
                </p>
              )}
              
              {item.overview && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {item.overview}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && searchTerm && (
        <div className="text-center text-muted-foreground py-8">
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};