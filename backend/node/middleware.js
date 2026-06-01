import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';
import { createHash } from 'crypto';
import { createJWToken } from './token.funtions.js';


dotenv.config();

export async function authMiddleware(req, res, next) {
   const accessToken =
        req.cookies.access_token;

    if(!accessToken){

        return res.status(401).json({
            message:'Unauthorized'
        });

    }

    try{

        const decoded =
            jwt.verify(
                accessToken,
                process.env.JWT_SECRET
            );

        req.user = decoded;

        next();

    }
    catch{

        return res.status(401).json({
            message:'Token invalid'
        });

    }

}