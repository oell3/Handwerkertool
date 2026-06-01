import { pool } from "./db/pool.js";

function normalizePositionsart(value) {
    const normalized = String(value || "").toLowerCase();

    if (normalized === "alternativ" || normalized === "alternativposition") {
        return "alternativ";
    }

    if (normalized === "eventual" || normalized === "eventualposition") {
        return "eventual";
    }

    return "normal";
}

async function loadRevisionData(revisionId) {
    const conn = await pool.connect();

    try {
        

        const [[angebot]] = await conn.query(`
            SELECT a.*, Date_FORMAT(r.erstellt_am, '%d.%m.%Y') as revisionsdatum
            FROM angebot_revisionen r
            JOIN angebote a ON a.ID = r.angebot_id
            WHERE r.id = ?
        `, [revisionId]);

        const [[kunde]] = await conn.query(`
              SELECT k.*
    FROM kunde k
    JOIN angebote a ON a.kunden_id = k.id
    JOIN angebot_revisionen ar ON ar.angebot_id = a.id
    WHERE ar.id = ?
`, [revisionId]);

        const [gruppen] = await conn.query(`
            SELECT *
            FROM angebot_revision_gruppen
            WHERE revision_id = ?
            ORDER BY sortierung
        `, [revisionId]);

        const [positionen] = await conn.query(`
            SELECT *
            FROM angebot_revision_positionen
            WHERE revision_id = ?
            ORDER BY sortierung
        `, [revisionId]);

        const gruppenMap = {};
        gruppen.forEach(g => {
            gruppenMap[g.id] = {
                ...g,
                nr: g.gruppen_nr,
                positionen: []
            };
        });

        const mischMap = {};
        const gruppeMap = {};

        positionen.forEach(p => {
            const normalizedType = String(p.typ || "").toLowerCase();
            const normalizedPositionsart = normalizePositionsart(p.positionsart);

            if (normalizedType === "misch") {
                mischMap[p.misch_id] = {
                    ...p,
                    typ: "misch",
                    positionsart: normalizedPositionsart,
                    children: []
                };

                gruppenMap[p.group_id]?.positionen.push(mischMap[p.misch_id]);
                return;
            }

            if (normalizedType === "gruppe") {
                gruppeMap[p.gruppe_id] = {
                    ...p,
                    typ: "gruppe",
                    positionsart: normalizedPositionsart,
                    children: []
                };

                gruppenMap[p.group_id]?.positionen.push(gruppeMap[p.gruppe_id]);
                return;
            }

            const normalizedPosition = {
                ...p,
                typ: "normal",
                positionsart: normalizedPositionsart
            };

            if (p.parent_misch_id && mischMap[p.parent_misch_id]) {
                mischMap[p.parent_misch_id].children.push(normalizedPosition);
                return;
            }

            if (p.parent_gruppe_id && gruppeMap[p.parent_gruppe_id]) {
                gruppeMap[p.parent_gruppe_id].children.push(normalizedPosition);
                return;
            }

            gruppenMap[p.group_id]?.positionen.push(normalizedPosition);
        });

    

        return {
            kunde,
            angebot,
            gruppen: Object.values(gruppenMap)
        };
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        conn.release();
    }
}

async function createRevision(angebotId) {
    const conn = await pool.connect();

    try {
        await conn.query('BEGIN');
console.log("1")
        const [revResult] = await conn.query(`
            INSERT INTO angebot_revisionen (angebot_id, erstellt_am)
            VALUES (?, NOW())
        `, [angebotId]);

        const revisionId = revResult.insertId;

        const [gruppen] = await conn.query(`
            SELECT * FROM crm.angebot_gruppen WHERE angebot_id = ?
        `, [angebotId]);

        const gruppenMap = {};
console.log("2")
        for (const g of gruppen) {
            const [res] = await conn.query(`
                INSERT INTO angebot_revision_gruppen
                (revision_id, gruppen_nr, bezeichnung, sortierung)
                VALUES (?, ?, ?, ?)
            `, [
                revisionId,
                g.gruppen_nr,
                g.bezeichnung,
                g.sortierung
            ]);

            gruppenMap[g.id] = res.insertId;
        }
console.log("3")
        const [positionen] = await conn.query(`
            SELECT * FROM crm.angebot_positionen WHERE angebot_id = ?
        `, [angebotId]);

        console.log("4")

        for (const p of positionen) {
            await conn.query(`
                INSERT INTO angebot_revision_positionen
                (revision_id, group_id, misch_id, parent_misch_id, gruppe_id, parent_gruppe_id,
                 typ, nr, bezeichnung, menge, einheit, ek, aufschlag, rabatt, ep, gp, sortierung,
                 bemerkung, positionsart)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                revisionId,
                gruppenMap[p.group_id],
                p.misch_id,
                p.parent_misch_id,
                p.gruppe_id,
                p.parent_gruppe_id,
                p.typ,
                p.nr,
                p.bezeichnung,
                p.menge,
                p.einheit,
                p.ek,
                p.aufschlag,
                p.rabatt,
                p.ep,
                p.gp,
                p.sortierung,
                p.bemerkung,
                p.positionsart
            ]);
        }

          console.log("5")

        await client.query('COMMIT');;
        return revisionId;
    } catch (err) {
         await client.query('ROLLBACK');
        throw err;
    } finally {
        conn.release();
    }
}

export { createRevision, loadRevisionData };
