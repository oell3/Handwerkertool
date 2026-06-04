
import express from 'express';
import { getallAnsprechpartner , getAnsprechpartnerByKundenId, getAnsprechpartner} from './ansprechpartner.funtion.js';


const router = express.Router();

router.get('/', async (req,res) =>{
 const mandantId = req.user.mandantid
  const data = await getallAnsprechpartner(mandantId);
  
 

  res.json(data)
});





router.get('/:id', async (req,res) =>{
 
  const mandantId = req.user.mandantid
  const data = await getAnsprechpartner(req.params.id, mandantId);

  res.json({items:data});

})

export default router;