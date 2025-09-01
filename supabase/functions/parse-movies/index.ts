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
      title: "Guardians of the Galaxy Vol. 3",
      year: 2023,
      imdb_rating: 7.9,
      description: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own.",
      quality: "BDRip",
      type: "movie"
    },
    {
      title: "The Night Agent",
      year: 2023,
      imdb_rating: 7.5,
      description: "A low-level FBI agent works in the basement of the White House manning a phone that never rings - until the night it does.",
      quality: "NF.WEB-DL",
      type: "series"
    },
    {
      title: "Scream VI",
      year: 2023,
      imdb_rating: 6.4,
      description: "In the next installment, the survivors of the Ghostface killings leave Woodsboro behind and start a fresh chapter in New York City.",
      quality: "CAMRip",
      type: "movie"
    },
    {
      title: "Wednesday",
      year: 2022,
      imdb_rating: 8.1,
      description: "Follows Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
      quality: "WEBRip",
      type: "series"
    },
    {
      title: "Black Panther: Wakanda Forever",
      year: 2022,
      imdb_rating: 6.7,
      description: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
      quality: "BluRay",
      type: "movie"
    }
  ];

  const mockEpisodes = [
    {
      movie_title: "The Night Agent",
      episodes: [
        { season_number: 1, episode_number: 1, title: "The Call" },
        { season_number: 1, episode_number: 2, title: "Redacted" },
        { season_number: 1, episode_number: 3, title: "The Trouble with All That Debt" },
        { season_number: 1, episode_number: 4, title: "Eyes Only" },
        { season_number: 1, episode_number: 5, title: "The Marionette" }
      ]
    },
    {
      movie_title: "Wednesday",
      episodes: [
        { season_number: 1, episode_number: 1, title: "Wednesday's Child Is Full of Woe" },
        { season_number: 1, episode_number: 2, title: "Woe Is the Loneliest Number" },
        { season_number: 1, episode_number: 3, title: "Friend or Woe" },
        { season_number: 1, episode_number: 4, title: "Woe What a Night" }
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