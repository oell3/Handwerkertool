import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { getallAngebote, updateOffer, saveOffer, loadConfig } from '../services/angebote.services.js';
import { createRevision, loadRevisionData } from '../pdf.js';
import { generatePDF } from '../database/documents.mjs';


const router = express.Router();

router.use('/vorlage/', )

router.use('/angebotserstellung', (req, res) => {

    res.render("angebotserstellung", {pageTitle: "Angebotserstellung"});
});

router.get('/', async (req, res) => {
  const data = await getallAngebote();

  res.render("angebote", {
    kunde: data.kunden,
    projekte: data.projekte,
    angebote: data.angebote
  });
});

router.get('/:revisionId/pdf', async (req, res) => {
  const {angebot, kunde, gruppen} = await loadRevisionData(req.params.revisionId);

  const config = await loadConfig();

  const netto = gruppen.flatMap(g => g.positionen).reduce((sum, pos) => sum + pos.menge * pos.ep, 0);
  const mwst = netto * 0.19;
  const brutto = netto + mwst;

  console.log("Netto:", netto);
  console.log("MwSt:", mwst);
  console.log("Brutto:", brutto);
    
  res.render("angebotsview", {
  angebot,
  kunde,
  gruppen,
  netto,
  mwst,
  brutto,
  config
});
});

router.delete('/:revisionId/pdf', async (req, res) => {
  const revisionId = req.params.revisionId;
  const filePath = path.join(process.cwd(), 'pdfs', `angebot_${revisionId}.pdf`);

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to delete PDF:', err);
      return res.status(500).json({ success: false, error: 'Unable to delete PDF' });
    }
  }

  res.json({ success: true });
});

router.post('/:id/create', async (req, res) => {

  const config = await loadConfig();
  const revisionId = await createRevision(req.params.id);
  const pdfPath = await generatePDF(revisionId, config);

  res.json({ success: true, revisionId, pdfPath });
});

router.post('/', async (req, res) => {
  const angebotId = await saveOffer(req);
  res.json({ success: true, angebotId });
});

router.put('/:id', async (req, res) => {
  const angebotId = await updateOffer(req);
  res.json({ success: true, angebotId });
});

export default router;