const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting moderation system migration...');
    
    // Create chat_flagged_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leets.chat_flagged_messages (
          id SERIAL PRIMARY KEY,
          message_id TEXT NOT NULL UNIQUE,
          message TEXT NOT NULL,
          username TEXT NOT NULL,
          avatar TEXT,
          level NUMERIC,
          campus TEXT,
          blocked BOOLEAN DEFAULT false,
          categories TEXT[],
          matched_terms TEXT[],
          severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed BOOLEAN DEFAULT false,
          reviewed_at TIMESTAMP,
          reviewed_by TEXT,
          action_taken TEXT,
          FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Table leets.chat_flagged_messages created successfully');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_messages_username ON leets.chat_flagged_messages(username);
    `);
    console.log('✅ Index on username created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_messages_severity ON leets.chat_flagged_messages(severity);
    `);
    console.log('✅ Index on severity created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_messages_reviewed ON leets.chat_flagged_messages(reviewed);
    `);
    console.log('✅ Index on reviewed created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_messages_created_at ON leets.chat_flagged_messages(created_at DESC);
    `);
    console.log('✅ Index on created_at created');
    
    // Create functions
    await client.query(`
      CREATE OR REPLACE FUNCTION leets.get_flagged_stats()
      RETURNS TABLE(
          total_flagged BIGINT,
          high_severity BIGINT,
          medium_severity BIGINT,
          low_severity BIGINT,
          unreviewed BIGINT
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              COUNT(*)::BIGINT as total_flagged,
              COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_severity,
              COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT as medium_severity,
              COUNT(*) FILTER (WHERE severity = 'low')::BIGINT as low_severity,
              COUNT(*) FILTER (WHERE reviewed = false)::BIGINT as unreviewed
          FROM leets.chat_flagged_messages;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Function get_flagged_stats created');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION leets.get_user_offenses(p_username TEXT)
      RETURNS TABLE(
          total_offenses BIGINT,
          high_severity_count BIGINT,
          medium_severity_count BIGINT,
          low_severity_count BIGINT,
          latest_offense TIMESTAMP
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              COUNT(*)::BIGINT as total_offenses,
              COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_severity_count,
              COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT as medium_severity_count,
              COUNT(*) FILTER (WHERE severity = 'low')::BIGINT as low_severity_count,
              MAX(created_at) as latest_offense
          FROM leets.chat_flagged_messages
          WHERE username = p_username;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Function get_user_offenses created');
    
    // Verify table exists
    const result = await client.query(`
      SELECT COUNT(*) as count FROM leets.chat_flagged_messages;
    `);
    console.log(`✅ Migration completed successfully! Current flagged messages count: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Moderation system ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
