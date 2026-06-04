import express from 'express';
import { getallObjekte, getallObjektebyKunde } from './objekte.function.js';



const router = express.Router()

router.get('/',  async (req, res) => {
   const mandantId = req.user.mandantid
  const data = await getallObjekte(mandantId);

  res.json(data)
})


router.get('/:id/kunde', async (req, res) => {
   const mandantId = req.user.mandantid

  const data = await getallObjektebyKunde(req.params.id);

  res.json(data);
})

export default router;