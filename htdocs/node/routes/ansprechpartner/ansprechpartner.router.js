
import express from 'express';
import { getallAnsprechpartner , getAnsprechpartnerByKundenId, getAnsprechpartner} from './ansprechpartner.funtion.js';


const router = express.Router();

router.get('/ansprechpartner', async (req,res) =>{
 const mandantId = req.user.mandant_id
  const [data] = await getallAnsprechpartner(mandantId);
  
 

  res.json({items:data.map((a) =>({
    id: a.ID,
    anrede: a.Anrede,
    name:  a.Name,
    vorname: a.Vorname,
    telefon: a.Telefon,
    mail: a.Mail,
    mobil: a.Mobil,
    haupt: a.Hauptansprechpartner
  }))})
});





router.get('/ansprechpartner/:id', async (req,res) =>{
 
  const mandantId = req.user.mandant_id
  const data = await getAnsprechpartner(req.params.id, mandantId);

  res.json({items:data});

})

export default router;