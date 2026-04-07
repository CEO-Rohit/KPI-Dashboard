/**
 * Database initialization script — runs schema.sql against PostgreSQL
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function initDatabase() {
  console.log('🔧 Initializing database schema...');
  
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✅ Database schema created successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Schema initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
