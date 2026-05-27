import { log } from "console";
import { pool } from "./db/pool.js";
import crypto from 'crypto'
import { createRefreshToken, createJWToken } from "./token.funtions.js";
import argon2 from 'argon2';


export async function authUser(name, password, ip, devicename) {

    const  user = await pool.query(
        `
        SELECT password_hash, id, mandant_id, rolle
        FROM crm.users
        WHERE email = $1
        `, [name]
    )

    if(user.rows.length === 0) throw new Error("Password und User können nicht gefunden werden")

    const test = await argon2.verify( user.rows[0].password_hash, password); //gibt true zurück, wenn übereinstimmt

    if(!test) throw new Error("Password und User können nicht gefunden werden");

    const refreshToken = await createRefreshToken(user.rows[0].id, ip, devicename)

    const accessToken = await createJWToken(user.rows[0].id, user.rows[0].mandant_id, user.rows[0].rolle)
    
    return {
        accessToken,
        refreshToken
    };

}
