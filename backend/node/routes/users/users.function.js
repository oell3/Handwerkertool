import * as argon2 from "argon2";
import { pool } from '../../db/pool.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

export async function createUser(name, password){

    
    const hashpassword = await createHash(password);


    try{
        const res = await pool.query(
            `
  INSERT INTO crm.users (email, password_hash, mandant_id, rolle)
  VALUES ($1, $2, $3, $4)
            `, [name, hashpassword, 1, "user"]
        )

        console.log(res);
    }catch(err){
        console.log(err);
        return err;
    }

    console.log("Finish");

    return;
}



async function createHash(password){

    const hashpassword = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
});


    return hashpassword;
}