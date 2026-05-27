import { pool } from "../db/pool.js";

export async function getallAngebote() {
  const [kundenRes, angeboteRes, projekteRes] = await Promise.all([
    pool.query("SELECT * FROM crm.kunde"),
    pool.query(`SELECT *, TO_CHAR(datum, 'DD.MM.YYYY') AS datum_formatiert FROM angebote`),
    pool.query("SELECT * FROM crm.projekte")
  ]);

  return {
    kunden: kundenRes.rows,
    angebote: angeboteRes.rows,
    projekte: projekteRes.rows
  };;
}

export async function loadConfig(customerID) {
  const result = await pool.query(
    `
    SELECT value
    FROM settings
    WHERE id = $1
    `,
    [customerID]
  );

  return result.rows[0]?.value ?? null;
}

export async function updateOffer(req) {
  const { angebotId, angebot, gruppen, positionen } = req.body;
  const conn = await pool.connect();

  try {
    await client.query('BEGIN');
    const gruppenMap = {};

    await conn.query(`
      UPDATE angebote
      SET Betrag = $1, Datum = $2, Status = $3, Einleitung = $4, Schluss = $5
      WHERE ID = $6
    `, [
      angebot.Betrag,
      angebot.Datum,
      angebot.Status,
      angebot.einleitung,
      angebot.schluss,
      angebotId
    ]);

    const dbGruppen = await conn.query(`
      SELECT id FROM angebot_gruppen WHERE angebot_id = $1
    `, [angebotId]);

    const dbIds = dbGruppen.rows.map(g => g.id);
    const frontendIds = gruppen.filter(g => g.id).map(g => g.id);

    if (dbIds.length) {
      await conn.query(`
        DELETE FROM angebot_gruppen
        WHERE angebot_id = $1
        AND id NOT IN ($2)
      `, [angebotId, frontendIds.length ? frontendIds : [0]]);
    }

    for (const gruppe of gruppen) {
      if (gruppe.id) {
        await conn.query(`
          UPDATE angebot_gruppen
          SET gruppen_nr = $1, bezeichnung = $2, sortierung = $3
          WHERE id = $4
        `, [
          gruppe.nr,
          gruppe.bezeichnung,
          gruppe.sortierung,
          gruppe.id
        ]);

        gruppenMap[gruppe.tempId] = gruppe.id;
      } else {
        const result = await conn.query(`
          INSERT INTO angebot_gruppen
          (angebot_id, gruppen_nr, bezeichnung, sortierung)
          VALUES ($1, $2, $3, $4)
        `, [
          angebotId,
          gruppe.nr,
          gruppe.bezeichnung,
          gruppe.sortierung
        ]);

        gruppenMap[gruppe.tempId] = result.rows.id;
      }
    }

    await conn.query(`
      DELETE FROM angebot_positionen
      WHERE angebot_id = $1
    `, [angebotId]);


    ///Multi-Row Insert
    for (const pos of positionen) {
      const values = [];
      const placeholders = [];

      positionen.forEach((pos, index) => {
        const offset = index * 19;

        placeholders.push(`(
    $${offset + 1},
    $${offset + 2},
    $${offset + 3},
    $${offset + 4},
    $${offset + 5},
    $${offset + 6},
    $${offset + 7},
    $${offset + 8},
    $${offset + 9},
    $${offset + 10},
    $${offset + 11},
    $${offset + 12},
    $${offset + 13},
    $${offset + 14},
    $${offset + 15},
    $${offset + 16},
    $${offset + 17},
    $${offset + 18},
    $${offset + 19}
  )`);

        values.push(
          angebotId,
          gruppenMap[pos.group_id],
          pos.misch_id ?? null,
          pos.parent_misch_id ?? null,
          pos.gruppe_id ?? null,
          pos.parent_gruppe_id ?? null,
          pos.typ,
          pos.nr,
          pos.bezeichnung,
          pos.menge,
          pos.einheit,
          pos.ek,
          pos.aufschlag,
          pos.rabatt,
          pos.ep,
          pos.gp,
          pos.sortierung,
          pos.bemerkung ?? null,
          pos.positionsart
        );
      });

      await client.query(
        `
  INSERT INTO angebot_positionen
  (
    angebot_id,
    group_id,
    misch_id,
    parent_misch_id,
    gruppe_id,
    parent_gruppe_id,
    typ,
    nr,
    bezeichnung,
    menge,
    einheit,
    ek,
    aufschlag,
    rabatt,
    ep,
    gp,
    sortierung,
    bemerkung,
    positionsart
  )
  VALUES ${placeholders.join(',')}
  `,
        values
      )};
      return angebotId;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      conn.release();
    }
  }

export async function newOffer(req) {
    const { angebot, gruppen, positionen } = req.body;
    const conn = await pool.connect();

    try {
      await conn.query('BEGIN');

      const gruppenMap = {};

      function parseOfferDate(value) {
        if (!value) return new Date();
        if (value instanceof Date) return value;
        const parts = value.split('.');
        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          return new Date(year, month - 1, day);
        }
        return new Date(value);
      }

      const offerDate = parseOfferDate(angebot.Datum);
      const year = offerDate.getFullYear();
      const month = String(offerDate.getMonth() + 1).padStart(2, '0');
      const kundenId = angebot.kundenId || 0;

      const [[countRow]] = await conn.query(`
      SELECT COUNT(*) AS count
      FROM angebote
      WHERE Datum = $1
    `, [angebot.Datum]);

      const sequence = String((countRow?.count || 0) + 1).padStart(2, '0');

      angebot.Angebotsnummer = `${year}${month}-${kundenId}-${sequence}`;

      const [result] = await conn.query(`
      INSERT INTO angebote
      (Angebotsnummer,Title, Objekt_ID, Kunden_ID, Betrag, Datum, Status, Projekt_ID, Einleitung, Schluss, Anrede)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
        angebot.Angebotsnummer,
        angebot.title,
        angebot.objekt,
        angebot.kundenId,
        angebot.Betrag,
        angebot.Datum,
        angebot.Status,
        angebot.projekt,
        angebot.einleitung,
        angebot.schluss,
        angebot.anrede
      ]);

      const angebotId = result.insertId;

      for (const gruppe of gruppen) {
        const [groupResult] = await conn.query(`
        INSERT INTO angebot_gruppen
        (angebot_id, gruppen_nr, bezeichnung, sortierung)
        VALUES ($1, $2, $3, $4)
      `, [
          angebotId,
          gruppe.nr,
          gruppe.bezeichnung,
          gruppe.sortierung
        ]);

        gruppenMap[gruppe.tempId] = groupResult.insertId;
      }

     const values = [];
const placeholders = [];

positionen.forEach((pos, index) => {
  const offset = index * 19;

  placeholders.push(`
    (
      $${offset + 1},
      $${offset + 2},
      $${offset + 3},
      $${offset + 4},
      $${offset + 5},
      $${offset + 6},
      $${offset + 7},
      $${offset + 8},
      $${offset + 9},
      $${offset + 10},
      $${offset + 11},
      $${offset + 12},
      $${offset + 13},
      $${offset + 14},
      $${offset + 15},
      $${offset + 16},
      $${offset + 17},
      $${offset + 18},
      $${offset + 19}
    )
  `);

  values.push(
    angebotId,
    gruppenMap[pos.group_id],
    pos.misch_id ?? null,
    pos.parent_misch_id ?? null,
    pos.gruppe_id ?? null,
    pos.parent_gruppe_id ?? null,
    pos.typ,
    pos.nr,
    pos.bezeichnung,
    pos.menge,
    pos.einheit,
    pos.ek,
    pos.aufschlag,
    pos.rabatt,
    pos.ep,
    pos.gp,
    pos.sortierung,
    pos.bemerkung ?? null,
    pos.positionsart
  );
});

await conn.query(
  `
  INSERT INTO angebot_positionen
  (
    angebot_id,
    group_id,
    misch_id,
    parent_misch_id,
    gruppe_id,
    parent_gruppe_id,
    typ,
    nr,
    bezeichnung,
    menge,
    einheit,
    ek,
    aufschlag,
    rabatt,
    ep,
    gp,
    sortierung,
    bemerkung,
    positionsart
  )
  VALUES
  ${placeholders.join(',')}
  `,
  values
);

      await client.query('COMMIT');;
      return angebotId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      conn.release();
    }
  }

  export async function saveOffer(req) {




    if (req.params.id) {
      return await updateOffer(req);
    }

    return await newOffer(req);
  }
