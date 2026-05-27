import { pool } from "../../db/pool.js";

export async function getallProjekte() {

  const [projekte] = await pool.query(
    "SELECT * FROM crm.projekte"
  );

  const result = {
    projekte
  };
  return (result);
}

export async function getallProjektebyKunde(kundenId) {

  const projekte = await pool.query(
    "SELECT * FROM crm.projekte WHERE Kunden_ID = $1",
    [kundenId]
  );

  const result = {
    projekte: projekte.rows
  };
  return (result);
}

export async function getallProjektebyObjekt(objektId) {

  const projekte = await pool.query(
    "SELECT * FROM crm.projekte WHERE Objekt_ID = $1",
    [objektId]
  );    
  const result = {
    projekte: projekte.rows
  };
  return (result);
}

export async function getallProjektedata(id) {

  const projektId = id;

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
    "SELECT * FROM crm.kunde "
  ),

  // Angebote
 pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Angebote WHERE Projekt_ID = $1",
    [projektId]
  ),

  // Objekte
  pool.query(
    "SELECT * FROM crm.Objekte WHERE ID = $1",
    [projektId]
  ),

  // Rechnungen
   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM Rechnungen WHERE Projekt_ID = $1",
    [projektId]
  ),

  pool.query(
    "SELECT * FROM crm.projekte WHERE Objekt_ID = $1",
    [projektId]
  ),

   pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy hh24:mm') AS datum_formatiert FROM termine WHERE Projekt_ID = $1",
    [projektId]
  ),

  pool.query(
    "SELECT *, to_char(datum, 'dd.mm.yyyy') AS datum_formatiert FROM 'verträge' WHERE Projekt_ID = $1",
    [projektId]
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

export async function getallprojektbyID(projektID) {

  const [
    projekteRes,
    kundeRes,
    angeboteRes,
    rechnungenRes,
    termineRes,
    projektdetailsRes,
    objektRes,
    ansprechpartnerRes
  ] = await Promise.all([

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from projekte
      where id = $1
      `,
      [projektID]
    ),

    pool.query(
      `
      select k.*
      from projekte p
      left join kunde k on k.id = p.kunden_id
      where p.id = $1
      `,
      [projektID]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from angebote
      where projekt_id = $1
      order by datum desc
      `,
      [projektID]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from rechnungen
      where projekt_id = $1
      `,
      [projektID]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from termine
      where projekt_id = $1
      order by datum desc
      `,
      [projektID]
    ),

    pool.query(
      `
      select *,
             to_char(datum, 'dd.mm.yyyy hh24:mi') as datum_formatiert
      from projektdetails
      where projekt_id = $1
      order by datum desc
      `,
      [projektID]
    ),

    pool.query(
      `
      select o.*
      from projekte p
      left join objekte o on o.id = p.objekt_id
      where p.id = $1
      `,
      [projektID]
    ),

    pool.query(
      `
      select a.*
      from projekte p
      left join ansprechpartner a
      on a.id = p.ansprechpartner_id
      where p.id = $1
      `,
      [projektID]
    )
  ]);

  return {
    projekte: projekteRes.rows[0],
    kunde: kundeRes.rows[0],
    angebote: angeboteRes.rows,
    rechnungen: rechnungenRes.rows,
    termine: termineRes.rows,
    projektdetails: projektdetailsRes.rows,
    objekt: objektRes.rows[0],
    ansprechpartner: ansprechpartnerRes.rows[0]
  };
}