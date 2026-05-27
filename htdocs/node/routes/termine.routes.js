import express from 'express';
import { getTermineByDay } from '../services/termine.services.js';
import axios from 'axios';

const router = express.Router();

router.get('/', (req, res) => {
  res.render("termine");
});

router.get('/api', async (req, res) => {
  try {
    const selectedDay = req.query.day;

    if (!selectedDay) return res.json({ termine: [] });

    const rows = await getTermineByDay(selectedDay);

    if (rows.length === 0) return res.json({ termine: [] });

    // 👉 dein Routing-Code bleibt gleich (gekürzt hier)
    // ... (OSRM + Berechnung)

    res.json({ termine: [] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;