import { pool } from "./db/pool.js"
import { token_refresh_hash, createRefreshToken, createJWToken } from "./token.funtions.js"
import { UAParser } from "ua-parser-js";


export async function refresh(req, res){
    const refresh_token = req.cookies.refresh_token;
    console.log("Refresh Token:", refresh_token);

    const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;
    
    const parser = new UAParser(req.headers['user-agent']);

    const result = parser.getResult();
    const deviceName =
    `${result.browser.name} on ${result.os.name}`;


    if(!refresh_token) return res.status(401).json({
        error: "Kein Refresh Token vorhanden"
    })

try{

    const userid =
        await revoke_refresh_token(
            refresh_token
        );

    const token =
        await createRefreshToken(
            userid,
            ip,
            deviceName
        );

    const userData =
        await userdata(userid);

    const accessToken =
        await createJWToken(
            userData.id,
            userData.mandant_id,
            userData.rolle
        );

    res.clearCookie(
        'refresh_token'
    );

    res.cookie(
        'refresh_token',
        token,
        {
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:30*24*60*60*1000
        }
    );

    res.cookie(
        'access_token',
        accessToken,
        {
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:15*60*1000
        }
    );

    return res.json({
        success:true
    });

}
catch(error){

    console.error(error);

    return res.status(401).json({
        error:'Refresh fehlgeschlagen'
    });

}

return res.status(200).json({
    success:true
});
 }

 async function userdata(userid){
    const result = await pool.query(`
        SELECT id, mandant_id, rolle
        FROM crm.users
        WHERE id = $1
    `, [userid]);
    return result.rows[0];
 }

export async function revoke_refresh_token(refreshToken){
   
    const token = await token_refresh_hash(refreshToken)

     const result = await pool.query(`
        UPDATE crm.refresh_tokens
        SET revoked = true, revoked_at = NOW(), reason_logout = 'Token Refresh'
        WHERE token_hash = $1
        AND revoked = false
        Returning user_id`, [token])
    
    if(result.rowCount === 0){
        throw new Error("Refresh Token konnte nicht gefunden werden!")
    }

    console.log(result.rows[0]);

    return result.rows[0].user_id;
}