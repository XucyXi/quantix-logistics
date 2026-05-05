/**
 * @fileoverview Database Initialization Script.
 * Used to bootstrap the database environment (creates DB, Users, and Tables).
 * Run with '--reset' flag to drop and recreate all tables and seed data.
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, '../.env')});

const isReset = process.argv.includes('--reset');

/**
 * Initializes the MySQL database, ensuring the correct database and user exist,
 * and executes the necessary SQL scripts to build or reset the schema.
 *
 * @returns {Promise<void>}
 */
async function initDB() {
  let connection;

  try {
    // Connect as Admin (Root) to create databases and users
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_ADMIN_USER,
      password: process.env.DB_ADMIN_PASS,
      multipleStatements: true,
    });

    console.log('Connected to MySQL server as admin');

    // Ensure Database Exists
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
    );
    console.log(`Database "${process.env.DB_NAME}" ensured`);

    // Ensure Application User Exists & Grant Privileges
    await connection.query(
      `CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASS}';`
    );
    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${process.env.DB_NAME}\`.* TO '${process.env.DB_USER}'@'localhost';`
    );
    await connection.query(`FLUSH PRIVILEGES;`);
    console.log('App user ensured and permissions granted');

    // Switch to Application Database
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    // SQL File Paths
    const resetPath = path.join(__dirname, '/reset_tables.sql');
    const createPath = path.join(__dirname, '/create_tables.sql');
    const seedPath = path.join(__dirname, '/seed.sql');

    if (isReset) {
      console.log('\nRESET MODE ACTIVATED');

      const resetSQL = fs.readFileSync(resetPath, 'utf-8');
      await connection.query(resetSQL);
      console.log('Tables dropped');

      const createSQL = fs.readFileSync(createPath, 'utf-8');
      await connection.query(createSQL);
      console.log('Tables recreated');

      const seedSQL = fs.readFileSync(seedPath, 'utf-8');
      await connection.query(seedSQL);
      console.log('Database seeded with initial data\n');
    } else {
      console.log('\nNORMAL MODE');

      const createSQL = fs.readFileSync(createPath, 'utf-8');
      await connection.query(createSQL);
      console.log('Tables ensured (IF NOT EXISTS)\n');
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
