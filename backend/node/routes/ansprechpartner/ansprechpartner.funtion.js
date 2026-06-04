import { pool } from "../../db/pool.js";


export async function getallAnsprechpartner(mandant_id){
        
    try{
    const ansprechpartner = await pool.query('SELECT * FROM crm.ansprechpartner WHERE mandant_id = $1', [mandant_id]);
      
        return ansprechpartner.rows;
  } catch (err) {
    console.error(err);

  }
}



export async function getAnsprechpartner(id){
        
    try{
    const ansprechpartner = await pool.query('SELECT * FROM crm.ansprechpartner WHERE ID = $1', [id]);
      
        return ansprechpartner.rows;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getAnsprechpartnerByKundenId(id){
      try{
    const ansprechpartner = await pool.query('SELECT * FROM crm.ansprechpartner WHERE Kunden_ID = $1', [id]);
        return ansprechpartner.rows;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
}