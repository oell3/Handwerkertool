import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';
import { refresh } from './refresh.functions.js';
import { UAParser } from "ua-parser-js";
dotenv.config();
export async function createJWToken(userid, mandant_id, role){
    return await jwt.sign({
        userid: userid,
        mandantid: mandant_id,
        role: role
    },
    process.env.JWT_SECRET,{
        expiresIn: '15min'
    }
    )
}

export async function token_refresh_hash(refreshToken){
    return await crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

}


export async function createRefreshToken(userid, ip, devicename){
 // echter zufälliger Token
    const token = {
        refreshToken: null,
        tokenHash: null
    };
    token.refreshToken = await crypto.randomBytes(64).toString('hex');
   
    token.tokenHash = await token_refresh_hash(token.refreshToken)

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await revoke_refresh_token(userid, devicename, ip);

    await pool.query(
        `
        INSERT INTO crm.refresh_tokens
        (user_id, token_hash, expires_at, device_name, ip)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
            userid,
            token.tokenHash,
            expiresAt,
            devicename,
            ip
        ]
    );

    return token.refreshToken;


} 

export async function revoke_refresh_token(userid, devicename, ip){

    
      await pool.query(
        `
        UPDATE refresh_tokens
        SET revoked = true
        WHERE
        user_id = $1
        AND device_name = $2
        AND ip = $3
        AND revoked = false
        `,
        [
            userid,
            devicename,
            ip
        ]
    );
}