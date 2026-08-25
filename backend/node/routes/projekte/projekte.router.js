import express from 'express'
import { getallProjekte, getallProjektebyKunde, getallProjektedata, getallProjektebyObjekt, getallprojektbyID } from './projekte.function.js'


const router = express.Router()

router.get('/:kundenid', async (req, res) => {
   const mandantId = req.user.mandantid
  
  const data = await getallProjektebyKunde(req.params.kundenid, mandantId);

  res.json(data)
})

router.get('/:kundenid/:objektid',  async (req, res) => {
  const mandantId = req.user.mandantid
  
  const data = await getallProjektebyObjekt(req.params.objektid, mandantId );

  res.json(data)
})

router.get('/', async (req, res) => {
   const mandantId = req.user.mandantid
   
  

  const data = await getallProjekte(mandantId);

  res.json(data)
});


export default router;