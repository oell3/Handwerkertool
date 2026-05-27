import { pool } from "../../db/pool.js";


export async function getVorlagenEinleitung() {
  const result = await pool.query(
    `
    SELECT *
    FROM crm.vorlagen
    WHERE typ = $1
    `,
    ['einleitung']
  );

  return result.rows;
}


export async function getVorlagenSchluss(){
        
    try{
    const vorlagen = await pool.query('SELECT * FROM crm.vorlagen WHERE typ = $1', ['schluss']);
  
        return vorlagen.rows;
  } catch (err) {
    console.error(err);

  }
}

export async function saveVorlage(name, content, type) {

  try {
    const exists = await pool.query(
      `select id from crm.vorlagen where name = $1`,
      [name]
    );

    let result;

    if (exists.rows.length > 0) {

      // UPDATE nur diese Vorlage
      result = await pool.query(
        `
        update crm.vorlagen
        set text = $1,
            typ = $2
        where name = $3
        returning id
        `,
        [content, type, name]
      );

    } else {

      result = await pool.query(
        `
        insert into crm.vorlagen (name, text, typ)
        values ($1, $2, $3)
        returning id
        `,
        [name, content, type]
      );
    }

    return result.rows[0].id;

  } catch (err) {
    console.error("Error saving template:", err);
    throw err;
  }
}