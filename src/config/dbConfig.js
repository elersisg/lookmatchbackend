const { text } = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración optimizada para Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
  ssl: { rejectUnauthorized: false },
  max: 3,
  keepAlive: true,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

module.exports = {
  pool,
  query: (text,params) => pool.query(text, params) //query para texts simples en los requests 
}

