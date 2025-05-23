const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'fall_detection',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('Error executing query', { text, err });
      throw err;
    }
  },

  async connect() {
    try {
      // Test the connection
      await pool.query('SELECT NOW()');
      return true;
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  },

  async close() {
    await pool.end();
  },

  getPool() {
    return pool;
  },
};