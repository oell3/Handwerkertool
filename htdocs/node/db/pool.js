import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();


export const pool = new Pool({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_database
});

