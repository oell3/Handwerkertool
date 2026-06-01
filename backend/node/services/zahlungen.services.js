import { pool } from "../db/pool.js";


export async function getallZahlungen() { /*getestet*/
  const [kunden] = await pool.query("SELECT * FROM crm.Kunde");
  const [zahlungen] = await pool.query("select *, DATE_FORMAT(datum, '%d.%m.%Y') AS datum_formatiert from zahlungen");
  const [rechnungen] = await pool.query("select *, DATE_FORMAT(datum, '%d.%m.%Y') AS datum_formatiert from rechnungen");

  console.log(rechnungen);
  const result = {
    kunden,
    zahlungen,
    rechnungen
  }
  return result;
}