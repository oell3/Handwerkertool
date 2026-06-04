import { pool } from "../../db/pool.js";



export async function getallObjekte(mandant_id) { /*getestet*/
  const kundendatenRes = await pool.query("SELECT * FROM crm.Kunde WHERE mandant_id = $1", [mandant_id]);
  const objekteRes = await pool.query("SELECT * FROM crm.objekte WHERE mandant_id = $1", [mandant_id]);

  const result = {
    kundendaten: kundendatenRes.rows,
    objekte: objekteRes.rows
  }
  return result;
}


export async function getallobjektData(id, mandant_id) {

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
    "SELECT * FROM crm.kunde WHERE mandant_id = $1", [mandant_id]
  ),

  // Angebote
  pool.query(
    "SELECT *,to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Angebote WHERE Objekt_ID = $1 AND mandant_id = $2",
    [objektId, mandant_id]
  ),

  // Objekte
  pool.query(
    "SELECT * FROM crm.Objekte WHERE ID = $1 AND mandant_id = $2",
    [objektId, mandant_id]
  ),

  // Rechnungen
  pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Rechnungen WHERE Objekt_ID = $1 AND mandant_id = $2",
    [objektId, mandant_id]
  ),

  pool.query(
    "SELECT * FROM crm.projekte WHERE Objekt_ID = $1 AND mandant_id = $2",
    [objektId, mandant_id]
  ),

   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy hh24:mi') AS datum_formatiert FROM termine WHERE Objekt_ID = $1 AND mandant_id = $2",
    [objektId, mandant_id]
  ),

   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM 'verträge' WHERE Objekt_ID = $1 AND mandant_id = $2",
    [objektId, mandant_ids]
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

export async function getallObjektebyKunde(kundenId, mandant_id) { /*getestet*/

  const objekte = await pool.query(`
    SELECT * FROM crm.objekte 
    WHERE KUNDEN_ID = $1 
    AND mandant_id = $2`,[kundenId, mandant_id]);

  
  return objekte.rows;
}