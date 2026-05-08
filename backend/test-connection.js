import pool from './config/db.js';

async function test() {

    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASS:', process.env.DB_PASS ? '*****' : 'MISSING');
    console.log('DB_NAME:', process.env.DB_NAME);

  const [rows] = await pool.query('SELECT 1');
  console.log('DB connected:', rows);
}

test();