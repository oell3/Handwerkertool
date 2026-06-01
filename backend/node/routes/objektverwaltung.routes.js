import express from 'express';
import { getallObjekte, getallobjektData } from '../services/objekte.services.js';



const router = express.Router();

router.get('/', (req, res) => {

    getallObjekte().then((data) => {
        res.render("objektverwaltung", {
            kunde: data.kundendaten,
            objekte: data.objekte
        });
    });
});

router.get('/:id', (req, res) => {
    const objektId = req.params.id;
    getallobjektData(objektId).then((data) => {
        res.render("objektverwaltung-details", {
            angebote: data.angebote,
            objekt: data.objekte,
            rechnungen: data.rechnungen,
            projekte: data.projekte,
            termine: data.termine,
            verträge: data.verträge
        });
    });
});

export default router;