import express from 'express'
import { getallProjekte, getallProjektebyKunde, getallProjektedata, getallProjektebyObjekt, getallprojektbyID } from './projekte.function.js'


const router = express.Router()

router.get('/:kundenid', authMiddleware, async (req, res) => {
   const mandantId = req.user.mandant_id
  
  const data = await getallProjektebyKunde(req.params.kundenid);

  res.json({items: data.projekte.map((p) =>({
    id: p.ID,
    name: p.Name,
    status: p.Status,
  }))})
})

router.get('/:kundenid/:objektid', authMiddleware,  async (req, res) => {
  const mandantId = req.user.mandant_id
  
  const data = await getallProjektebyObjekt(req.params.objektid);

  res.json({items: data.projekte.map((p) =>({
    id: p.ID,
    name: p.Name,
    status: p.Status,
  }))})
})

router.get('/', async (req, res) => {
   const mandantId = req.user.mandant_id

  const data = await getallProjekte(mandantId);

  res.json({items: data.projekte.map((p) =>({
    id: p.ID,
    name: p.Name,
    status: p.Status,
  }))})
})

export default router;