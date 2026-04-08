const { pool } = require('./database');
const { execSync } = require('child_process');

async function checkAndSeed() {
  console.log('🧐 Checking database status on Render...');
  const client = await pool.connect();
  try {
    // Check if the tables exist
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'daily_kpi_data'
      );
    `);
    
    const tableExists = res.rows[0].exists;
    let rowCount = 0;
    
    if (tableExists) {
      const countRes = await client.query('SELECT COUNT(*) FROM daily_kpi_data');
      rowCount = parseInt(countRes.rows[0].count);
    }

    if (!tableExists || rowCount === 0) {
      console.log('⚠️ Database is empty. Seeding dashboard data...');
      
      // We run these via execSync so we don't have to duplicate the logic here
      execSync('npm run db:init', { stdio: 'inherit' });
      execSync('npm run seed', { stdio: 'inherit' });
      
      console.log('✅ Database successfully seeded for production.');
    } else {
      console.log(`✅ Database already contains data (${rowCount} records). Skipping auto-seed.`);
    }
  } catch (err) {
    console.error('❌ Database check failed:', err.message);
    if (err.message.includes('relation "daily_kpi_data" does not exist')) {
        console.log('⚠️ Tables missing. Initializing schema...');
        execSync('npm run db:init', { stdio: 'inherit' });
        execSync('npm run seed', { stdio: 'inherit' });
    }
  } finally {
    client.release();
    // We don't close the pool here because the main server will need it
  }
}

// Export as a function so we can await it in server.js
module.exports = checkAndSeed;
