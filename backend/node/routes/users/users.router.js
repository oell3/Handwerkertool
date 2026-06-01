import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { authUser, createUser } from './users.function.js';
import { UAParser } from 'ua-parser-js';
import { log } from 'console';

const router = express.Router();

router.post('/test', (req, res) => {
  

    console.log("Name:", req.body.name, "Password:", req.body.password);

    res.json({ ok: true });
});

router.post('/create',  (req,res) =>{
    
      const { name, password } = req.body;
      console.log(name, password);

     try {
        const response = createUser(name, password);
        
        return res.json({ ok: true,
            response
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            ok: false,
            error: err.message || err
        });
    }
    
})

export default router;