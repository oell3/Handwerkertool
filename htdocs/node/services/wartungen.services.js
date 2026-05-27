import { pool } from "../db/pool.js";

export async function getallWartungen() { /*getestet*/
  const [wartungen] = await pool.query("select *, DATE_FORMAT(datum, '%d.%m.%Y') AS datum_formatiert from Wartungen");
  const [kunden] = await pool.query("SELECT * FROM crm.kunde");
  const [objekte] = await pool.query("SELECT * FROM crm.objekte");


  const result = {
    wartungen,
    kunden,
    objekte
  }
  return result;
}
