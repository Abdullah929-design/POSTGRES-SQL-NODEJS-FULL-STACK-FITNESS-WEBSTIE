const { Pool } = require('pg');

const regions = ['oregon', 'frankfurt', 'singapore', 'ohio'];

async function tryConnect() {
  for (const region of regions) {
    const host = `dpg-d4cqbbkhg0os73d7vk8g-a.${region}-postgres.render.com`;
    console.log(`Trying region ${region} with host: ${host}`);
    
    const pool = new Pool({
      connectionString: `postgresql://gym_db_k035_user:R02nURdwDYJDM6rMaC30cG2Rfj2Fcw4j@${host}/gym_db_k035`,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESS: Connected to region ${region}!`);
      
      // Check tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('Tables found:', tables.rows.map(r => r.table_name));
      
      if (tables.rows.length > 0) {
        // Check if there are foods
        try {
          const foods = await client.query('SELECT COUNT(*) FROM food_items');
          console.log(`Food items count: ${foods.rows[0].count}`);
        } catch (e) {
          console.log('Error querying food_items:', e.message);
        }
      }
      
      client.release();
      await pool.end();
      return;
    } catch (err) {
      console.log(`❌ FAILED for region ${region}:`, err.message);
    }
  }
}

tryConnect();
