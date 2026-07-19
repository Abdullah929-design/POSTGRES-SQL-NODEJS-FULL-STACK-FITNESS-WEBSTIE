const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get the connection string from command line arguments
const connectionString = process.argv[2];
const sqlFileName = process.argv[3] || 'setup_database.sql';

if (!connectionString) {
  console.error('❌ Error: Please provide your database connection string.');
  console.log('\nUsage:');
  console.log('  node setup-remote-db.js "your_external_connection_string" [sql_file_name]');
  console.log('\nExamples:');
  console.log('  # For a fresh database setup:');
  console.log('  node setup-remote-db.js "postgres://user:password@host/dbname"');
  console.log('\n  # For running the authentication migration on an existing database:');
  console.log('  node setup-remote-db.js "postgres://user:password@host/dbname" migrations/001_add_users_auth.sql\n');
  process.exit(1);
}

async function runSetup() {
  console.log('⏳ Connecting to the remote database...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Bypasses self-signed certificate issues on Render
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Read the SQL file
    const sqlPath = path.join(__dirname, sqlFileName);
    console.log(`📖 Reading SQL file from ${sqlPath}...`);
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at ${sqlPath}`);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`⚡ Running script: ${sqlFileName}...`);
    await client.query(sql);
    console.log(`🎉 Database script executed successfully!`);

    // Verify if food_items exists to print counts
    try {
      const res = await client.query('SELECT COUNT(*) FROM food_items');
      console.log(`📊 Verified: ${res.rows[0].count} food items currently in the database.`);
    } catch (e) {
      console.log('ℹ️ Verified: Executed successfully (food_items count query skipped or not present).');
    }

  } catch (err) {
    console.error('❌ Error executing database script:');
    console.error(err.message);
    console.log('\nCommon troubleshooting steps:');
    console.log('1. Make sure you are using the EXTERNAL connection string (not the Internal one).');
    console.log('2. Ensure your local IP address is whitelisted in the Render Database dashboard under "Access Control".');
  } finally {
    await client.end();
  }
}

runSetup();

