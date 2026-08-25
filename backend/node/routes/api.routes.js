import express from 'express';
import { authMiddleware } from '../middleware.js';

import vorlageRoute from './vorlage/vorlage.router.js'
import dashboardRoute from './dashboard/dashboard.routes.js'
import objekteRoute from './objekte/objekte.router.js'
import kundeRoute from './kunde/kunde.router.js'
import ansprechpartnerRoute from './ansprechpartner/ansprechpartner.router.js'
import projekteRouter from './projekte/projekte.router.js'
import offerRouter from './offer/offer.router.js'

const router = express.Router();

router.use('/vorlagen', vorlageRoute)

router.use('/dashboard', dashboardRoute)

router.use('/objekte', objekteRoute)

router.use('/kunden', kundeRoute)

router.use('/ansprechpartner', ansprechpartnerRoute)

router.use('/projekte', projekteRouter)

router.use('/offer', offerRouter)
export default router;