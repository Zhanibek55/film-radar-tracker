// Apply TMDB migration to Supabase database
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = "https://phqnhkncdqjyuihgrigf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocW5oa25jZHFqeXVpaGdyaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDMyNTUsImV4cCI6MjA3MjMxOTI1NX0.0k7HRX_oTM9MJ7iOpOU9El3FYjFkOLapZPLM7yO4_4U";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigration() {
  console.log('🔧 Applying TMDB Integration Migration...\n');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/20250115000000_add_tmdb_integration.sql', 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('📏 Migration size:', migrationSQL.length, 'characters');
    
    // Split into individual statements (rough approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('🔢 Found', statements.length, 'SQL statements');
    
    // Apply each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n${i + 1}/${statements.length}. Executing statement...`);
      
      try {
        // For ALTER TABLE statements, we need to use rpc or raw SQL
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX') || statement.includes('CREATE FUNCTION')) {
          console.log('   ⚠️  Complex statement detected - may require database admin access');
          console.log('   Statement:', statement.substring(0, 100) + '...');
          
          // Try to execute via RPC if possible
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            if (error.message.includes('function exec_sql does not exist')) {
              console.log('   ❌ Cannot execute - requires direct database access');
              console.log('   💡 This statement needs to be run by database admin');
              errorCount++;
            } else {
              throw error;
            }
          } else {
            console.log('   ✅ Executed successfully');
            successCount++;
          }
        } else {
          console.log('   ℹ️  Simple statement - skipping for now');
        }
      } catch (error) {
        console.log('   ❌ Error:', error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed - this is expected without database admin access');
      console.log('💡 Alternative approaches:');
      console.log('   1. Use Supabase Dashboard SQL Editor');
      console.log('   2. Contact database admin');
      console.log('   3. Use manual column addition through Dashboard');
    }
    
  } catch (error) {
    console.log('❌ Migration failed:', error.message);
  }
}

async function manualMigration() {
  console.log('\n🛠️  Attempting Manual Migration (Basic Fields Only)...\n');
  
  // We can try to add some basic columns that don't require admin access
  const basicFields = [
    { name: 'tmdb_id', type: 'INTEGER' },
    { name: 'poster_tmdb_url', type: 'TEXT' },
    { name: 'backdrop_url', type: 'TEXT' },
    { name: 'torrent_release_date', type: 'TIMESTAMP WITH TIME ZONE' },
    { name: 'source_quality_score', type: 'INTEGER DEFAULT 0' }
  ];
  
  console.log('🔧 Trying to add basic TMDB fields...');
  
  for (const field of basicFields) {
    try {
      console.log(`   Adding ${field.name}...`);
      
      // This will likely fail without proper permissions, but let's try
      const { data, error } = await supabase.rpc('add_column_if_not_exists', {
        table_name: 'movies',
        column_name: field.name,
        column_type: field.type
      });
      
      if (error) {
        console.log(`   ❌ Cannot add ${field.name}:`, error.message);
      } else {
        console.log(`   ✅ Added ${field.name} successfully`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to add ${field.name}:`, error.message);
    }
  }
}

async function testCurrentState() {
  console.log('\n🧪 Testing Current Database State...\n');
  
  // Test what we can currently do
  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Cannot query movies:', error.message);
    } else {
      console.log('✅ Can query movies table');
      if (movies.length > 0) {
        console.log('📋 Current fields:', Object.keys(movies[0]).join(', '));
      }
    }
  } catch (error) {
    console.log('❌ Database query failed:', error.message);
  }
  
  // Test if we can insert with new fields
  console.log('\n🧪 Testing insert with TMDB fields...');
  try {
    const testMovie = {
      title: 'TMDB Test Movie - ' + Date.now(),
      year: 2024,
      type: 'movie',
      tmdb_id: 12345, // This will fail if column doesn't exist
      poster_tmdb_url: 'https://image.tmdb.org/t/p/w500/test.jpg'
    };
    
    const { data, error } = await supabase
      .from('movies')
      .insert(testMovie)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Cannot insert with TMDB fields:', error.message);
      console.log('   This confirms migration is needed');
    } else {
      console.log('✅ Can insert with TMDB fields - migration already applied!');
      
      // Clean up test data
      await supabase.from('movies').delete().eq('id', data.id);
    }
  } catch (error) {
    console.log('❌ Insert test failed:', error.message);
  }
}

// Run migration process
async function runMigration() {
  console.log('🚀 Supabase Migration Tool\n');
  console.log('=' .repeat(50));
  
  await testCurrentState();
  await applyMigration();
  await manualMigration();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Migration process completed!');
  console.log('\n💡 If migration failed, use Supabase Dashboard:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Open SQL Editor');
  console.log('   3. Paste contents of: supabase/migrations/20250115000000_add_tmdb_integration.sql');
  console.log('   4. Run the migration manually');
}

runMigration().catch(console.error);