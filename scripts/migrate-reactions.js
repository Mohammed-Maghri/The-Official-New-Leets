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
    console.log('🔄 Starting reactions migration...');
    
    // Create chat_reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leets.chat_reactions (
        id SERIAL PRIMARY KEY,
        message_id TEXT NOT NULL,
        username TEXT NOT NULL,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, username, emoji),
        FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Table leets.chat_reactions created successfully');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON leets.chat_reactions(message_id);
    `);
    console.log('✅ Index on message_id created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_reactions_username ON leets.chat_reactions(username);
    `);
    console.log('✅ Index on username created');
    
    // Verify table exists
    const result = await client.query(`
      SELECT COUNT(*) as count FROM leets.chat_reactions;
    `);
    console.log(`✅ Migration completed successfully! Current reactions count: ${result.rows[0].count}`);
    
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
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
