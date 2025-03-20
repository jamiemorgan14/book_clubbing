import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_club',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigration() {
  const client = await pool.connect();
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '20240320_create_refresh_tokens.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Start transaction
    await client.query('BEGIN');

    // Run the migration
    await client.query(migrationSQL);

    // Commit transaction
    await client.query('COMMIT');

    console.log('Migration completed successfully');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 