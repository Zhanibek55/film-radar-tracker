// Test Supabase connection and database operations
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://phqnhkncdqjyuihgrigf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDMyNTUsImV4cCI6MjA3MjMxOTI1NX0.0k7HRX_oTM9MJ7iOpOU9El3FYjFkOLapZPLM7yO4_4U";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase Connection...\n');
  
  // Test 1: Basic connection
  console.log('1. Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection error:', error.message);
      return false;
    }
    
    console.log(`✅ Connected successfully! Found ${data || 0} movies in database`);
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
  
  // Test 2: Check current schema
  console.log('\n2. Checking current database schema...');
  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Schema check error:', error.message);
    } else {
      console.log('✅ Current movie table structure:');
      if (movies && movies.length > 0) {
        const sampleMovie = movies[0];
        const fields = Object.keys(sampleMovie);
        console.log('   Fields:', fields.join(', '));
        
        // Check for new TMDB fields
        const tmdbFields = ['tmdb_id', 'poster_tmdb_url', 'backdrop_url', 'torrent_release_date', 'source_quality_score'];
        const missingFields = tmdbFields.filter(field => !fields.includes(field));
        
        if (missingFields.length > 0) {
          console.log('⚠️  Missing TMDB fields:', missingFields.join(', '));
          console.log('   -> Migration needed!');
        } else {
          console.log('✅ All TMDB fields present');
        }
      } else {
        console.log('   No movies found, checking table structure...');
      }
    }
  } catch (error) {
    console.log('❌ Schema check failed:', error.message);
  }
  
  // Test 3: Check episodes table
  console.log('\n3. Checking episodes table...');
  try {
    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Episodes table error:', error.message);
    } else {
      console.log(`✅ Episodes table accessible. Found ${episodes || 0} episodes`);
    }
  } catch (error) {
    console.log('❌ Episodes table check failed:', error.message);
  }
  
  // Test 4: Test Edge Function
  console.log('\n4. Testing parse-movies Edge Function...');
  try {
    const { data, error } = await supabase.functions.invoke('parse-movies', {
      body: { test: true, limit: 1 }
    });
    
    if (error) {
      console.log('❌ Edge Function error:', error.message);
      console.log('   This is expected if function is not deployed yet');
    } else {
      console.log('✅ Edge Function responded:', data);
    }
  } catch (error) {
    console.log('⚠️  Edge Function not available:', error.message);
    console.log('   This is normal if not deployed yet');
  }
  
  return true;
}

async function testDataOperations() {
  console.log('\n📊 Testing Database Operations...\n');
  
  // Test 5: Insert test movie
  console.log('5. Testing insert operation...');
  const testMovie = {
    title: 'Test Movie - ' + Date.now(),
    year: 2024,
    imdb_rating: 8.5,
    description: 'Test movie for Supabase integration',
    type: 'movie',
    quality: '1080p.BluRay'
  };
  
  try {
    const { data, error } = await supabase
      .from('movies')
      .insert(testMovie)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Insert error:', error.message);
    } else {
      console.log('✅ Insert successful:', data.title);
      
      // Test 6: Update the test movie
      console.log('\n6. Testing update operation...');
      const { data: updatedData, error: updateError } = await supabase
        .from('movies')
        .update({ description: 'Updated test description' })
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Update error:', updateError.message);
      } else {
        console.log('✅ Update successful');
      }
      
      // Test 7: Delete the test movie
      console.log('\n7. Testing delete operation...');
      const { error: deleteError } = await supabase
        .from('movies')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.log('❌ Delete error:', deleteError.message);
      } else {
        console.log('✅ Delete successful');
      }
    }
  } catch (error) {
    console.log('❌ Database operation failed:', error.message);
  }
}

async function checkMigrationNeeded() {
  console.log('\n🔧 Checking Migration Status...\n');
  
  try {
    // Try to select new TMDB fields
    const { data, error } = await supabase
      .from('movies')
      .select('tmdb_id, poster_tmdb_url, backdrop_url, torrent_release_date, source_quality_score, genres')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Migration needed! TMDB fields are missing');
        console.log('   Error:', error.message);
        console.log('\n📋 Next steps:');
        console.log('   1. Apply migration: supabase/migrations/20250115000000_add_tmdb_integration.sql');
        console.log('   2. Or run: supabase db reset (if using local dev)');
        return false;
      } else {
        console.log('❌ Unexpected error:', error.message);
        return false;
      }
    } else {
      console.log('✅ All TMDB fields are present in database');
      console.log('   Migration already applied or not needed');
      return true;
    }
  } catch (error) {
    console.log('❌ Migration check failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Supabase Integration Test\n');
  console.log('=' .repeat(50));
  
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.log('\n❌ Connection failed. Check your Supabase credentials.');
    return;
  }
  
  await testDataOperations();
  await checkMigrationNeeded();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Supabase integration test completed!');
}

runAllTests().catch(console.error);