import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';

// Funktion
import { login } from './login.functions.js';
import { logout } from './logout.functions.js';


// Router

import apiRoute from './routes/api.routes.js'
import { authMiddleware } from './middleware.js';
import { refresh } from './refresh.functions.js';




const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:4200',
    credentials: true
  }));
app.use('/pdfs', express.static('pdfs'));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ==============================
// ROUTES 
// ==============================

app.use('/api', authMiddleware, apiRoute)

app.use('/login', login)
app.use('/logout', authMiddleware,  logout)
app.use('/refresh', refresh )
// Dashboard View

app.get( '/auth/status', authMiddleware, (req, res) => {
        res.json({
            authenticated: true
        });
    }
);

app.listen(8080, () => {
  console.log('Server läuft auf Port 8080');
});
