import express from 'express';
import { getallProjekte, getallprojektbyID } from '../services/projekte.services.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await getallProjekte();

  res.render("projekte", {
    projekte: data.projekte,
    termine: data.termine,
    kunde: data.kunden
  });
});

router.get('/:id', async (req, res) => {
  const [result] = await getallprojektbyID(req.params.id);

  res.render("projektdetails", {
    projekt: result.projekte,
    angebote: result.angebote,
    termine: result.termine,
    rechnungen: result.rechnungen,
    projektdetails: result.projektdetails,
    kunde: result.kunde,
    objekt: result.objekt,
    ansprechpartner: result.ansprechpartner
  });
});

export default router;