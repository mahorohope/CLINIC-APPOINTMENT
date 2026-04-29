// src/database.js
require('dotenv').config(); 
const { Pool } = require('pg');

// This connects to the DATABASE_URL in your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

// Test the connection as soon as the app starts
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Supabase connection error:', err.message);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL successfully!');
  }
});

module.exports = pool;