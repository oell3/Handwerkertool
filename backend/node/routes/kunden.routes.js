import express from 'express';
import { getallKunden, getallKundenbyId, getKundenKords } from '../services/kunden.services.js';
import { getAnsprechpartnerByKundenId } from '../services/api.services.js';

const router = express.Router();

// View: alle Kunden
router.get('/', async (req, res) => {
  const data = await getallKunden();

  res.render("kunden", {
    kunde: data.kundendaten,
    projekte: data.projekte,
  });
});

// View: Kunde Details
router.get('/:id', async (req, res) => {
  const data = await getallKundenbyId(req.params.id);

  console.log(data);

  res.render("kundendetails", {
     kunde: data.kundendaten,
    ansprechpartner: data.ansprechpartner,
    angebote: data.angebote,
    objekte: data.objekte,
    rechnungen: data.rechnungen,
    projekte: data.projekte,
    termine: data.termine,
    verträge: data.verträge,
  });
});

// API
router.get('/api/coords/:id', async (req, res) => {
  console.log(req.params.id);
  const data = await getKundenKords(req.params.id);
  res.json(data);
});

router.get('/:kundenId/ansprechpartner', async (req, res) => {
  try {
    const data = await getAnsprechpartnerByKundenId(req.params.kundenId);

    res.json( {items: data.map((a) =>({
    id: a.ID,
    name: a.Name,
    vorname: a.Vorname,
    telefon: a.Telefon,
    mail: a.Mail,
    mobil: a.Mobil,
    haupt: a.Hauptansprechpartner
  }))})

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});



export default router;