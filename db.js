import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create a new pool using your environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this
  ssl: { rejectUnauthorized: false }, // required for Render
});

export default pool;
