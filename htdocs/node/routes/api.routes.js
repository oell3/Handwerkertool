import express from 'express';
import { authMiddleware } from '../middleware.js';

import vorlageRoute from './vorlage/vorlage.router.js'
import dashboardRoute from './dashboard/dashboard.routes.js'
import objekteRoute from './objekte/objekte.router.js'
import kundeRoute from './kunde/kunde.router.js'
import ansprechparnterRoute from './ansprechpartner/ansprechpartner.router.js'

const router = express.Router();

router.use('/vorlage', vorlageRoute)

router.use('/dashboard', dashboardRoute)

router.use('/objekte', objekteRoute)

router.use('/kunde', kundeRoute)

router.use('/ansprechpartner', ansprechparnterRoute)

export default router;