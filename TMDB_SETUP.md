# TMDB API Integration Setup

This project now includes integration with The Movie Database (TMDB) API to fetch high-quality movie and TV show information, including posters, ratings, and metadata.

## API Key Setup

Your TMDB API key has been configured: `71267e8d8cb4eb11223acc05a37bd4ad`

### Environment Variables

The following environment variables have been set up:

- `VITE_TMDB_API_KEY` - Your TMDB API key (for frontend)
- `VITE_TMDB_BASE_URL` - TMDB API base URL
- `VITE_TMDB_IMAGE_BASE_URL` - TMDB image base URL
- `TMDB_API_KEY` - API key for Supabase Edge Functions

## Files Created/Modified

### New Files:
1. **`.env`** - Environment configuration with your TMDB API key
2. **`.env.example`** - Template for environment variables
3. **`src/services/tmdb.ts`** - TMDB API service with comprehensive methods
4. **`src/components/TMDBTest.tsx`** - Test component for TMDB integration
5. **`TMDB_SETUP.md`** - This setup guide

### Modified Files:
1. **`.gitignore`** - Added environment files to exclusion list
2. **`supabase/functions/parse-movies/index.ts`** - Enhanced with TMDB integration

## Features Added

### TMDB Service (`src/services/tmdb.ts`)
- Search movies and TV shows
- Get detailed information including posters and ratings
- Automatic poster URL generation
- Enhanced search with year matching
- Rate limiting and error handling

### Enhanced Movie Parsing
The Supabase function now:
- Enriches parsed movie data with TMDB information
- Fetches high-quality poster images
- Gets accurate ratings and descriptions
- Adds TMDB IDs for future reference

### Movie Data Enhancement
Movies now include:
- **TMDB ID** - For future API calls
- **High-quality posters** - From TMDB image CDN
- **Accurate ratings** - TMDB vote averages
- **Rich descriptions** - TMDB overviews
- **Backdrop images** - For enhanced UI
- **Genre information** - TMDB genre IDs

## Usage Examples

### Frontend TMDB Service Usage
```typescript
import { tmdbService } from '@/services/tmdb';

// Search for movies
const movieResults = await tmdbService.searchMovies('Inception');

// Search for TV shows
const tvResults = await tmdbService.searchTVShows('Breaking Bad');

// Get popular content
const popular = await tmdbService.getPopularMovies();

// Enrich movie data
const enriched = await tmdbService.enrichMovieData('Dune', 2021, 'movie');
```

### Testing the Integration

You can test the TMDB integration by:

1. **Using the Test Component**:
   ```typescript
   import { TMDBTest } from '@/components/TMDBTest';
   
   // Add to your app to test search functionality
   <TMDBTest />
   ```

2. **Running the Movie Parser**:
   The parser will now automatically enrich movie data with TMDB information when you trigger the `parse-movies` function.

## API Rate Limiting

The integration includes proper rate limiting:
- 250ms delay between TMDB API calls
- Error handling for API failures
- Fallback to original data if TMDB fails

## Image URLs

TMDB provides several image sizes. The service is configured to use:
- **Posters**: `w500` (500px wide)
- **Backdrops**: `w1280` (1280px wide)

You can change these by modifying the service methods or passing different sizes.

## Deployment Notes

When deploying to production:

1. **Supabase Edge Functions**: Set the `TMDB_API_KEY` environment variable in your Supabase project settings.

2. **Frontend**: Ensure your deployment platform has access to the VITE environment variables.

3. **Security**: The API key is exposed to the frontend, which is normal for TMDB as it's designed for client-side use.

## Next Steps

With TMDB integration set up, you can now:

1. **Enhance the UI** with high-quality movie posters
2. **Add more movie details** like cast, crew, and genres
3. **Implement recommendation systems** using TMDB's similar movies API
4. **Add movie trailers** using TMDB's video endpoints
5. **Create watchlists** with TMDB data

## Troubleshooting

If you encounter issues:

1. **Check API Key**: Ensure your TMDB API key is valid and active
2. **Rate Limits**: TMDB allows 40 requests per 10 seconds for free accounts
3. **CORS Issues**: TMDB API supports CORS, so browser requests should work
4. **Network Issues**: Check your internet connection and TMDB service status

The integration is now ready to use and will automatically enhance your movie data with rich TMDB information!