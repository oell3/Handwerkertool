import express from 'express';
import { getDashboard } from './dashboard.function.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await getDashboard(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




export default router;