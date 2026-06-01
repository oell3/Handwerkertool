import { pool } from "../../db/pool.js";
import { getCache, getPreviousRange, setCache } from "../../utlis/cache.js";

export async function getDashboard(req) {
  const { start, end } = req.query;

  if (!start || !end) {
    throw new Error("Start/End fehlt");
  }

  const cacheKey = `${start}_${end}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const { prevStart, prevEnd } = getPreviousRange(start, end);

  // =========================
  // parallel queries
  // =========================

  const [statsRes, rechnungenRes, angeboteRes, zahlungenRes] =
    await Promise.all([
      // stats
      pool.query(
        `
        select
          (
            select coalesce(sum(betrag), 0)
            from rechnungen
            where status = 'versendet'
            and datum between $1 and $2
          ) as r_now,

          (
            select coalesce(sum(betrag), 0)
            from rechnungen
            where status = 'versendet'
            and datum between $3 and $4
          ) as r_prev,

          (
            select coalesce(sum(betrag), 0)
            from angebote
            where datum between $5 and $6
          ) as a_now,

          (
            select coalesce(sum(betrag), 0)
            from angebote
            where datum between $7 and $8
          ) as a_prev,

          (
            select coalesce(sum(betrag), 0)
            from zahlungen
            where status = 'bezahlt'
            and datum between $9 and $10
          ) as z_now,

          (
            select coalesce(sum(betrag), 0)
            from zahlungen
            where status = 'bezahlt'
            and datum between $11 and $12
          ) as z_prev
        `,
        [
          start, end,
          prevStart, prevEnd,
          start, end,
          prevStart, prevEnd,
          start, end,
          prevStart, prevEnd
        ]
      ),

      // rechnungen
      pool.query(
        `
        select
          date(datum) as datum,
          sum(betrag) as gesamtbetrag,
          to_char(datum, 'dd.mm.yyyy') as datum_formatiert
        from rechnungen
        where status = 'versendet'
        and datum between $1 and $2
        group by date(datum), datum
        order by datum
        `,
        [start, end]
      ),

      // angebote
      pool.query(
        `
        select
          date(datum) as datum,
          sum(betrag) as gesamtbetrag,
          to_char(datum, 'dd.mm.yyyy') as datum_formatiert
        from angebote
        where datum between $1 and $2
        group by date(datum), datum
        order by datum
        `,
        [start, end]
      ),

      // zahlungen
      pool.query(
        `
        select
          date(datum) as datum,
          sum(betrag) as gesamtbetrag,
          to_char(datum, 'dd.mm.yyyy') as datum_formatiert
        from zahlungen
        where status = 'bezahlt'
        and datum between $1 and $2
        group by date(datum), datum
        order by datum
        `,
        [start, end]
      )
    ]);

  const result = {
    stats: statsRes.rows[0],
    rechnungen: rechnungenRes.rows,
    angebote: angeboteRes.rows,
    zahlungen: zahlungenRes.rows
  };

  setCache(cacheKey, result);

  return result;
}