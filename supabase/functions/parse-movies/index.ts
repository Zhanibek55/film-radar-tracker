import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MovieData {
  title: string;
  year?: number;
  imdb_rating?: number;
  description?: string;
  poster_url?: string;
  quality?: string;
  type: 'movie' | 'series';
}

interface EpisodeData {
  season_number: number;
  episode_number: number;
  title?: string;
  air_date?: string;
}

// Mock function to simulate parsing different movie sites
async function parseMovieSites(): Promise<{ movies: MovieData[], episodes: { movie_title: string, episodes: EpisodeData[] }[] }> {
  // In a real implementation, this would scrape actual movie sites
  // For now, we'll return some mock data to demonstrate functionality
  
  const mockMovies: MovieData[] = [
    {
      title: "Dune: Part Two",
      year: 2024,
      imdb_rating: 8.5,
      description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      quality: "4K",
      type: "movie"
    },
    {
      title: "The Last of Us",
      year: 2023,
      imdb_rating: 8.7,
      description: "Joel and Ellie, a pair connected through the harshness of the world they live in, are forced to endure brutal circumstances and ruthless killers.",
      quality: "HD",
      type: "series"
    },
    {
      title: "Avatar: The Way of Water",
      year: 2022,
      imdb_rating: 7.6,
      description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
      quality: "4K",
      type: "movie"
    }
  ];

  const mockEpisodes = [
    {
      movie_title: "The Last of Us",
      episodes: [
        { season_number: 1, episode_number: 1, title: "When You're Lost in the Darkness" },
        { season_number: 1, episode_number: 2, title: "Infected" },
        { season_number: 1, episode_number: 3, title: "Long, Long Time" },
        { season_number: 1, episode_number: 4, title: "Please Hold to My Hand" },
        { season_number: 1, episode_number: 5, title: "Endure and Survive" }
      ]
    }
  ];

  return { movies: mockMovies, episodes: mockEpisodes };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log('Starting movie parsing...');
    
    // Parse movie sites (mock implementation)
    const { movies, episodes } = await parseMovieSites();
    
    console.log(`Found ${movies.length} movies to process`);

    // Insert or update movies
    for (const movieData of movies) {
      // Check if movie already exists
      const { data: existingMovie } = await supabaseClient
        .from('movies')
        .select('id')
        .eq('title', movieData.title)
        .eq('year', movieData.year)
        .single();

      if (existingMovie) {
        // Update existing movie
        const { error: updateError } = await supabaseClient
          .from('movies')
          .update({
            ...movieData,
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMovie.id);

        if (updateError) {
          console.error('Error updating movie:', updateError);
        } else {
          console.log(`Updated movie: ${movieData.title}`);
        }
      } else {
        // Insert new movie
        const { data: insertedMovie, error: insertError } = await supabaseClient
          .from('movies')
          .insert({
            ...movieData,
            last_checked: new Date().toISOString()
          })
          .select('id, title')
          .single();

        if (insertError) {
          console.error('Error inserting movie:', insertError);
        } else {
          console.log(`Inserted new movie: ${movieData.title}`);
        }
      }
    }

    // Process episodes for series
    for (const episodeData of episodes) {
      // Find the movie
      const { data: movie } = await supabaseClient
        .from('movies')
        .select('id')
        .eq('title', episodeData.movie_title)
        .eq('type', 'series')
        .single();

      if (movie) {
        // Insert episodes (ignore duplicates)
        for (const episode of episodeData.episodes) {
          const { error: episodeError } = await supabaseClient
            .from('episodes')
            .upsert({
              movie_id: movie.id,
              ...episode
            }, {
              onConflict: 'movie_id,season_number,episode_number'
            });

          if (episodeError) {
            console.error('Error inserting episode:', episodeError);
          } else {
            console.log(`Processed episode S${episode.season_number}E${episode.episode_number} for ${episodeData.movie_title}`);
          }
        }
      }
    }

    const response = {
      success: true,
      message: `Successfully processed ${movies.length} movies`,
      processed_movies: movies.length,
      processed_episodes: episodes.reduce((total, series) => total + series.episodes.length, 0),
      timestamp: new Date().toISOString()
    };

    console.log('Parsing completed successfully:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in parse-movies function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});