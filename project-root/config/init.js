const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const isReset = process.argv.includes('--reset');

async function runSQL(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  await connection.query(sql);
}

async function initDB() {
  let connection;

  console.log("ENV DEBUG:", {
    DB_ADMIN_USER: process.env.DB_ADMIN_USER,
    DB_ADMIN_PASS: process.env.DB_ADMIN_PASS
  });

  try {
    // 1. Connect as admin
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_ADMIN_USER,
      password: process.env.DB_ADMIN_PASS,
      multipleStatements: true
    });

    console.log('Connected as admin');

    const dbName = process.env.DB_NAME;

    // 2. RESET MODE = DROP DATABASE (cleanest solution)
    if (isReset) {
      console.log("RESET MODE: Dropping database...");

      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      console.log("Database dropped");
    }

    // 3. Recreate DB
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database ${dbName} ensured`);

    await connection.query(`USE \`${dbName}\``);

    // 4. Create app user
    await connection.query(
      `CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASS}'`
    );

    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${process.env.DB_USER}'@'localhost'`
    );

    await connection.query(`FLUSH PRIVILEGES`);
    console.log("App user ready");

    // 5. Run schema
    const createPath = path.join(__dirname, 'create_tables.sql');
    await runSQL(connection, createPath);
    console.log("Schema created");

    // 6. Seed only in reset mode
    if (isReset) {
      const seedPath = path.join(__dirname, 'seed.sql');
      await runSQL(connection, seedPath);
      console.log("Database seeded");
    }

    console.log("DB initialization complete");

  } catch (err) {
    console.error("DB INIT ERROR:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDB();
