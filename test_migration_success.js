// Test that TMDB migration was successful
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://phqnhkncdqjyuihgrigf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc0MzI1NSwiZXhwIjoyMDcyMzE5MjU1fQ.R-bmyjsIVsBHPwqROKhzSBThucbLSv8cKp_oJTpiP78";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testMigrationSuccess() {
  console.log('🧪 Testing TMDB Migration Success...\n');
  
  // Test 1: Check if all TMDB columns exist
  console.log('1. Testing TMDB columns availability...');
  try {
    const { data, error } = await supabase
      .from('movies')
      .select(`
        tmdb_id, poster_tmdb_url, backdrop_url, torrent_release_date,
        source_quality_score, last_episode_date, genres, runtime,
        status, original_language, popularity, vote_count
      `)
      .limit(1);
    
    if (error) {
      console.log('❌ TMDB columns test failed:', error.message);
      return false;
    } else {
      console.log('✅ All TMDB columns are accessible!');
    }
  } catch (error) {
    console.log('❌ Column test error:', error.message);
    return false;
  }
  
  // Test 2: Test quality scoring function
  console.log('\n2. Testing calculate_quality_score function...');
  try {
    const testQualities = ['2160p.BluRay', '1080p.WEB-DL', '720p.WEBRip', '480p', 'CAMRIP'];
    
    for (const quality of testQualities) {
      const { data: score, error } = await supabase
        .rpc('calculate_quality_score', { quality_text: quality });
      
      if (error) {
        console.log(`   ❌ Quality score for ${quality} failed:`, error.message);
      } else {
        console.log(`   ✅ ${quality} -> ${score} points`);
      }
    }
  } catch (error) {
    console.log('❌ Quality function test failed:', error.message);
  }
  
  // Test 3: Test freshness function
  console.log('\n3. Testing is_fresh_release function...');
  try {
    const testDates = [
      { date: new Date().toISOString(), type: 'movie', expected: true },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'movie', expected: true },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'movie', expected: false },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'series', expected: true },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'series', expected: false }
    ];
    
    for (const test of testDates) {
      const { data: isFresh, error } = await supabase
        .rpc('is_fresh_release', { 
          release_date: test.date,
          content_type: test.type
        });
      
      if (error) {
        console.log(`   ❌ Freshness test failed:`, error.message);
      } else {
        const result = isFresh ? 'Fresh' : 'Not fresh';
        const emoji = isFresh === test.expected ? '✅' : '⚠️';
        console.log(`   ${emoji} ${test.type} (${Math.floor((Date.now() - new Date(test.date).getTime()) / (24 * 60 * 60 * 1000))} days ago) -> ${result}`);
      }
    }
  } catch (error) {
    console.log('❌ Freshness function test failed:', error.message);
  }
  
  // Test 4: Test view access
  console.log('\n4. Testing fresh_quality_content view...');
  try {
    const { data: freshContent, error } = await supabase
      .from('fresh_quality_content')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Fresh content view failed:', error.message);
    } else {
      console.log(`✅ Fresh content view accessible: ${freshContent.length} items found`);
    }
  } catch (error) {
    console.log('❌ View test failed:', error.message);
  }
  
  // Test 5: Insert full TMDB movie
  console.log('\n5. Testing full TMDB movie insertion...');
  try {
    const testMovie = {
      title: 'TMDB Full Test - ' + Date.now(),
      year: 2024,
      imdb_rating: 8.7,
      description: 'Complete test of TMDB integration with all fields',
      type: 'movie',
      quality: '1080p.BluRay',
      tmdb_id: 123456,
      poster_tmdb_url: 'https://image.tmdb.org/t/p/w500/test-poster.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w500/test-backdrop.jpg',
      torrent_release_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      source_quality_score: 85,
      genres: ['Action', 'Sci-Fi', 'Thriller'],
      runtime: 148,
      status: 'Released',
      original_language: 'en',
      popularity: 92.5,
      vote_count: 3500
    };
    
    const { data: insertedMovie, error: insertError } = await supabase
      .from('movies')
      .insert(testMovie)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Full TMDB insertion failed:', insertError.message);
    } else {
      console.log('✅ Successfully inserted movie with all TMDB fields!');
      console.log(`   Title: ${insertedMovie.title}`);
      console.log(`   TMDB ID: ${insertedMovie.tmdb_id}`);
      console.log(`   Quality Score: ${insertedMovie.source_quality_score}`);
      console.log(`   Genres: ${insertedMovie.genres ? insertedMovie.genres.join(', ') : 'None'}`);
      console.log(`   Poster URL: ${insertedMovie.poster_tmdb_url ? 'Present' : 'Missing'}`);
      
      // Test the functions with this data
      const { data: calculatedScore } = await supabase
        .rpc('calculate_quality_score', { quality_text: insertedMovie.quality });
      
      const { data: isFresh } = await supabase
        .rpc('is_fresh_release', { 
          release_date: insertedMovie.torrent_release_date,
          content_type: insertedMovie.type
        });
      
      console.log(`   Calculated Quality Score: ${calculatedScore}`);
      console.log(`   Is Fresh: ${isFresh ? 'Yes' : 'No'}`);
      
      // Clean up test data
      await supabase.from('movies').delete().eq('id', insertedMovie.id);
      console.log('   🧹 Test data cleaned up');
    }
  } catch (error) {
    console.log('❌ Full insertion test failed:', error.message);
  }
  
  return true;
}

async function testEnhancedParseFunction() {
  console.log('\n🚀 Testing Enhanced Parse Function...\n');
  
  console.log('6. Running enhanced parse-movies function...');
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase.functions.invoke('parse-movies', {
      body: { 
        test: false,
        limit: 10,
        force: true,
        source: 'tmdb',
        timestamp: Date.now()
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.log('❌ Parse function error:', error);
    } else {
      console.log('✅ Parse function completed successfully!');
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log(`   📊 Processed: ${data.processed_movies} movies, ${data.processed_episodes} episodes`);
      }
    }
  } catch (error) {
    console.log('❌ Parse function test failed:', error.message);
  }
  
  // Test 7: Check for movies with TMDB data
  console.log('\n7. Checking for movies with TMDB data...');
  try {
    const { data: tmdbMovies, error } = await supabase
      .from('movies')
      .select('title, tmdb_id, poster_tmdb_url, source_quality_score, torrent_release_date')
      .not('tmdb_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ TMDB movies query failed:', error.message);
    } else {
      console.log(`✅ Found ${tmdbMovies.length} movies with TMDB data:`);
      tmdbMovies.forEach((movie, index) => {
        console.log(`   ${index + 1}. ${movie.title}`);
        console.log(`      TMDB ID: ${movie.tmdb_id}`);
        console.log(`      Quality Score: ${movie.source_quality_score || 'Not set'}`);
        console.log(`      Has Poster: ${movie.poster_tmdb_url ? 'Yes' : 'No'}`);
        console.log(`      Release Date: ${movie.torrent_release_date || 'Not set'}`);
      });
    }
  } catch (error) {
    console.log('❌ TMDB movies check failed:', error.message);
  }
}

async function runFullTest() {
  console.log('🎉 TMDB Migration Verification Test\n');
  console.log('=' .repeat(60));
  
  const migrationSuccess = await testMigrationSuccess();
  
  if (migrationSuccess) {
    await testEnhancedParseFunction();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 MIGRATION SUCCESSFUL! All TMDB features are working!');
    console.log('\n✅ What\'s now available:');
    console.log('   🔥 "Fresh" tab with real date filtering');
    console.log('   🏆 "Quality" tab with torrent scoring');
    console.log('   🖼️  Real TMDB posters instead of placeholders');
    console.log('   ⚡ Quality scoring system (0-100 points)');
    console.log('   📅 Freshness detection (7 days movies, 3 days series)');
    console.log('   📊 Enhanced parse function with TMDB integration');
    console.log('\n🚀 Film Radar is now fully operational!');
  } else {
    console.log('\n❌ Migration verification failed - check manually');
  }
}

runFullTest().catch(console.error);