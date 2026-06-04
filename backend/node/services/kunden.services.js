import { pool } from "../db/pool.js";

export async function getallKunden(mandant_id) { /*getestet*/

  const result = await pool.query("SELECT * FROM crm.kunde WHERE mandant_id = $1", [mandant_id]);

  return result.rows;
}
export async function getallKundenData(mandant_id) { /*getestet*/

  const kundendaten = await pool.query("SELECT * FROM crm.kunde WHERE mandant_id = $1", [mandant_id]);
  const projekte = await pool.query("SELECT * FROM crm.projekte WHERE mandant_id = $1", [mandant_id]);

  const result = {
    kundendaten: kundendaten.rows,
    projekte: projekte.rows
  }
  return result;
}

 
export async function getallKundenbyId(id, mandant_id) {
  const kundenId = id;

  const [
    kundeRes,
    ansprechpartnerRes,
    angeboteRes,
    objekteRes,
    rechnungenRes,
    projekteRes,
    termineRes,
    vertraegeRes
  ] = await Promise.all([
    pool.query(`SELECT * FROM crm.kunde WHERE id = $1 AND mandant_id = $2`, [kundenId, mandant_id]),

    pool.query(
      `SELECT * FROM crm.ansprechpartner WHERE kunden_id = $1 AND mandant_id = $2`,
      [kundenId, mandant_id]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from angebote
      WHERE kunden_id = $1 AND mandant_id = $2
      `,
      [kundenId, mandant_id]
    ),

    pool.query(
      `SELECT * FROM crm.objekte WHERE kunden_id = $1 AND mandant_id = $2`,
      [kundenId, mandant_id]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from rechnungen
      WHERE kunden_id = $1 AND mandant_id = $2
      `,
      [kundenId, mandant_id]
    ),

    pool.query(
      `SELECT * FROM crm.projekte WHERE kunden_id = $1 AND mandant_id = $2`,
      [kundenId, mandant_id]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from termine
      WHERE kunden_id = $1 AND mandant_id = $2
      `,
      [kundenId, mandant_id]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from verträge
      WHERE kunden_id = $1 AND mandant_id = $2
      `,
      [kundenId, mandant_id]
    )
  ]);

  return {
    kundendaten: kundeRes.rows[0],
    ansprechpartner: ansprechpartnerRes.rows,
    angebote: angeboteRes.rows,
    objekte: objekteRes.rows,
    rechnungen: rechnungenRes.rows,
    projekte: projekteRes.rows,
    termine: termineRes.rows,
    verträge: vertraegeRes.rows
  };
}

export async function getKundenKords(req, mandant_id) {
  const id =req;
  
  const row = await pool.query(`
                                    SELECT lat, lon
                                    FROM kunde
                                    WHERE ID = $1 AND mandant_id = $2
    `, [id, mandant_id])
 
    return row.rows;
  
}


