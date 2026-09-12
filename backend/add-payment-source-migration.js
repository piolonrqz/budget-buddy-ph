const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    
    // Add payment_source to expenses
    await client.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS payment_source VARCHAR(50) DEFAULT 'cash';
    `);
    
    console.log('Added payment_source to expenses');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
