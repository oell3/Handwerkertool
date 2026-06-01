import { pool } from "../db/pool.js";

export async function getallKatalog() { /*getestet*/
  const katalog = await pool.query("SELECT * FROM crm.katalog");

  return katalog.rows;
}


