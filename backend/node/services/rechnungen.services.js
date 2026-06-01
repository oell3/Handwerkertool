import { pool } from "../db/pool.js";

export async function getallRechnungen() { /*getestet*/

  const [
    kundeRes,
    objektRes,
    rechnungenRes
  ] = await Promise.all([
    pool.query("SELECT * FROM crm.Kunde"),

    pool.query("SELECT * FROM crm.objekte"),

  pool.query("select *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert from rechnungen")

  ])

  const result = {
    kunden: kundeRes.rows,
    objekte: objektRes.rows,
    rechnungen: rechnungenRes.rows
  }
  return result;
}