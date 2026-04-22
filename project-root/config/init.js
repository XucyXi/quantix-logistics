const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isReset = process.argv.includes('--reset');

async function initDB() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_ADMIN_USER,
      password: process.env.DB_ADMIN_PASS,
      multipleStatements: true
    });

    console.log('Connected to MySQL server as admin');

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
    );
    console.log(`Database "${process.env.DB_NAME}" ensured`);

    await connection.query(
      `CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASS}';`
    );
    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${process.env.DB_NAME}\`.* TO '${process.env.DB_USER}'@'localhost';`
    );
    await connection.query(`FLUSH PRIVILEGES;`);
    console.log('App user ensured and permissions granted');

    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    const resetPath = path.join(__dirname, 'config/reset_tables.sql');
    const createPath = path.join(__dirname, 'config/create_tables.sql');
    const seedPath = path.join(__dirname, 'config/seed.sql');

    if (isReset) {
      console.log(' RESET MODE ');

      const resetSQL = fs.readFileSync(resetPath, 'utf-8');
      await connection.query(resetSQL);
      console.log('Tables dropped');

      const createSQL = fs.readFileSync(createPath, 'utf-8');
      await connection.query(createSQL);
      console.log('Tables recreated');

      const seedSQL = fs.readFileSync(seedPath, 'utf-8');
      await connection.query(seedSQL);
      console.log('Database seeded');

    } else {
      console.log(' NORMAL MODE ');

      const createSQL = fs.readFileSync(createPath, 'utf-8');
      await connection.query(createSQL);
      console.log('Tables ensured (IF NOT EXISTS)');
    }

    console.log('DB initialization complete');

  } catch (err) {
    console.error('DB INIT ERROR:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
}

initDB();