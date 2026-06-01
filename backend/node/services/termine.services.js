import { pool } from "../db/pool.js";

export async function getTermineByDay(selectedDay) {

  const result = await pool.query(
    `
    select
      t.id,
      t.datum,
      k.name as kunde,
      p.adresse,
      p.plz,
      p.stadt,
      p.lat,
      p.lon
    from termine t
    join kunde k on t.kunden_id = k.id
    join projekte p on t.projekt_id = p.id
    where t.datum >= $1::date
      and t.datum < ($1::date + interval '1 day')
    order by t.datum asc
    `,
    [selectedDay]
  );

  return result.rows;
}