import { pool } from "../../db/pool.js";



export async function getallObjekte() { /*getestet*/
  const kundendatenRes = await pool.query("SELECT * FROM crm.Kunde");
  const objekteRes = await pool.query("SELECT * FROM crm.objekte");

  const result = {
    kundendaten: kundendatenRes.rows,
    objekte: objekteRes.rows
  }
  return result;
}


export async function getallobjektData(id, mandantid) {

  const objektId = id;
  const [
    kundeRes,
    angeboteRes,
    objekteRes,
    rechnungenRes,
    projekteRes,
    termineRes,
    verträgeRes
  ] = await Promise.all([

  pool.query(
    "SELECT * FROM crm.kunde"
  ),

  // Angebote
  pool.query(
    "SELECT *,to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Angebote WHERE Objekt_ID = $1",
    [objektId]
  ),

  // Objekte
  pool.query(
    "SELECT * FROM crm.Objekte WHERE ID = $1",
    [objektId]
  ),

  // Rechnungen
  pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Rechnungen WHERE Objekt_ID = $1",
    [objektId]
  ),

  pool.query(
    "SELECT * FROM crm.projekte WHERE Objekt_ID = $1",
    [objektId]
  ),

   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy hh24:mi') AS datum_formatiert FROM termine WHERE Objekt_ID = $1",
    [objektId]
  ),

   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM 'verträge' WHERE Objekt_ID = $1",
    [objektId]
  )
    ])

  const result = {
    kunde: kundeRes.rows,
    angebote: angeboteRes.rows,
    objekte: objekteRes.rows[0],
    rechnungen: rechnungenRes.rows,
    projekte: projekteRes.rows,
    termine: termineRes.rows,
    verträge: verträgeRes.rows
  };

  return (result);
}

export async function getallObjektebyKunde(kundenId) { /*getestet*/

  const objekte = await pool.query(`
    SELECT * FROM crm.objekte 
    WHERE KUNDEN_ID = $1`,[kundenId]);

  
  return objekte.rows;
}