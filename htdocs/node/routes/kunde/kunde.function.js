import { pool } from "../../db/pool.js";


export async function getallKundenbyId(id) {
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
    pool.query(`SELECT * FROM crm.kunde where id = $1`, [kundenId]),

    pool.query(
      `SELECT * FROM crm.ansprechpartner where kunden_id = $1`,
      [kundenId]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from angebote
      where kunden_id = $1
      `,
      [kundenId]
    ),

    pool.query(
      `SELECT * FROM crm.objekte where kunden_id = $1`,
      [kundenId]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from rechnungen
      where kunden_id = $1
      `,
      [kundenId]
    ),

    pool.query(
      `SELECT * FROM crm.projekte where kunden_id = $1`,
      [kundenId]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from termine
      where kunden_id = $1
      `,
      [kundenId]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy') as datum_formatiert
      from verträge
      where kunden_id = $1
      `,
      [kundenId]
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

export async function getKundenKords(req) {
  const id =req;
  
  const row = await pool.query(`
                                    SELECT lat, lon
                                    FROM kunde
                                    WHERE ID = $1
    `, [id])
 
    return row.rows;
  
}
