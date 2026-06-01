
import express from 'express'
import { getallKunden, getallKundenbyId} from '../../services/kunden.services.js'

getallKunden

const router = express.Router()

router.get('/:id/ansprechpartner',  async (req,res) =>{
 const mandantId = req.user.mandant_id
  const data = await getAnsprechpartnerByKundenId(req.params.id, mandantId);

  res.json({items: data.map((a) =>({
    id: a.ID,
    anrede: a.Anrede,
    name: a.Name,
    vorname: a.Vorname,
    telefon: a.Telefon,
    mail: a.Mail,
    mobil: a.Mobil,
    haupt: a.Hauptansprechpartner
  }))});

})

router.get('/', async (req, res) => {
   const mandantId = req.user.mandant_id
  const data = await getallKunden(mandantId);

  res.json( {items: data.kundendaten.map((a) =>({
    id: a.ID,
    name:  a.Name,
    adresse: a.Adresse,
    plz: a.PLZ,
    stadt: a.Stadt,
    telefon: a.Telefon,
    mail: a.Mail,
  }))})
})


router.get('/:id', async (req, res) => {
  
  const data = await getallKundenbyId(req.params.id, req.user.mandant_id);

  res.json("kundendetails", data);
});
export default router;