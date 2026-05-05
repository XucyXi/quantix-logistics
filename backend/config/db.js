/**
 * @fileoverview Database Configuration.
 * Initializes and exports a MySQL connection pool using environment variables.
 * We use a default export here because this pool is imported globally across all services.
 */

import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force path to ensure .env is loaded correctly regardless of where the app is started
dotenv.config({path: path.resolve(__dirname, '../.env')});

/**
 * The MySQL connection pool.
 * Handles reconnects and manages multiple concurrent database connections efficiently.
 *
 * @type {import('mysql2/promise').Pool}
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
