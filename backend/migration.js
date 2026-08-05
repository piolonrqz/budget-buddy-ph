const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    
    // Add pay_frequency to salary_profiles
    await client.query(`
      ALTER TABLE salary_profiles 
      ADD COLUMN IF NOT EXISTS pay_frequency VARCHAR(50) DEFAULT 'bi-monthly';
    `);
    
    console.log('Added pay_frequency to salary_profiles');

    // Create incomes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        income_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        description VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Created incomes table');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
