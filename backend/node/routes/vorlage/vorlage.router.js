import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import {getVorlagenEinleitung, getVorlagenSchluss} from './vorlage.function.js';


const router = express.Router();

router.get('/', async (req, res) => {
 
  const mandantId = req.user.mandantid 
  const einleitung = await getVorlagenEinleitung(mandantId);
  const schluss = await getVorlagenSchluss(mandantId);


  res.json({einleitung:einleitung, schluss:schluss});
});

router.get('/einleitung', async (req, res) => {

  const mandantId = req.user.mandantid 
  const data = await getVorlagenEinleitung(mandantId);

  res.json(data);
});

router.get('/schluss', async (req, res) => {
   const mandantId = req.user.mandantid 
  const data = await getVorlagenSchluss(mandantId);

  res.json(data);
});


router.put('/save', async (req, res) => {
   const mandantId = req.user.mandantid
  
  const { name, content, type } = req.body; 
  saveVorlage(name, content, type);
  // Here you would typically save the template to a database or file system
  // For this example, we'll just return a success response
  res.json({ success: true, message: 'Vorlage gespeichert' });
});


export default router;