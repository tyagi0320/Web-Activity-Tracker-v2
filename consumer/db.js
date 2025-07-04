require('dotenv').config();

const { Pool } = require("pg");


const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

const insertActivity = async ({
  session_id,
  event,
  url,
  timestamp,
  browser,
  platform,
  ip_address,
  user_agent
}) => {
  const query = `
    INSERT INTO activity_logs (
      session_id, event, url, timestamp,
      browser, platform, ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  await pool.query(query, [
    session_id,
    event,
    url,
    timestamp,
    browser,
    platform,
    ip_address,
    user_agent,
  ]);
};

module.exports = {
  insertActivity,
};