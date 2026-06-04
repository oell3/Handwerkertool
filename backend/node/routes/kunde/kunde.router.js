
import express from 'express'
import { getallKunden, getallKundenbyId} from '../../services/kunden.services.js'


const router = express.Router()

router.get('/:id/ansprechpartner',  async (req,res) =>{
 const mandantId = req.user.mandantid
  const data = await getAnsprechpartnerByKundenId(req.params.id, mandantId);

  res.json(data);

})

router.get('/', async (req, res) => {
   const mandantId = req.user.mandantid
  const data = await getallKunden(mandantId);

  res.json( data)
})

router.get('/all', async (req, res) => {
   const mandantId = req.user.mandantid
  const data = await getallKundenData(mandantId);

  res.json( data)
})


router.get('/:id', async (req, res) => {
  
  const data = await getallKundenbyId(req.params.id, req.user.mandantid);

  res.json("kundendetails", data);
});
export default router;