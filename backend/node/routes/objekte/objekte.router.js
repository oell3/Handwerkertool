import express from 'express';
import { getallObjekte, getallObjektebyKunde } from './objekte.function.js';



const router = express.Router()

router.get('/',  async (req, res) => {
   const mandantId = req.user.mandant_id
  const data = await getallObjekte();

  res.json( {items: data.objekte.map((o) =>({
    id: o.ID,
    adresse: o.Adresse,
    plz: o.PLZ,
    stadt: o.Stadt,
    kundenId: o.Kunden_ID
  }))})
})


router.get('/:id/kunde', async (req, res) => {
   const mandantId = req.user.mandant_id

  const data = await getallObjektebyKunde(req.params.id);

  res.json({items: data.map((o) =>({
    id: o.ID,
    adresse: o.Adresse,
    plz: o.PLZ,
    stadt: o.Stadt 
  }))});
})

export default router;