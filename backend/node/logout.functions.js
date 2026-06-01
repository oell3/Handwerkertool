import { pool } from "./db/pool.js";
import { token_refresh_hash } from "./token.funtions.js";

export async function logout(req, res){

    const user_id = req.user.userid;
    const refreshToken = req.cookies.refresh_token;

    await revoke_refresh_token(refreshToken, user_id);
    
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 Tage
    });
    res.clearCookie("access_token",{
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });
}

async function revoke_refresh_token(refreshToken, user_id){

    const tokenHash = await token_refresh_hash(refreshToken);
    await pool.query(
        `
        UPDATE refresh_tokens
        SET revoked = true
        WHERE token_hash = $1 AND user_id = $2 AND revoked = false
        `,
        [tokenHash, user_id])

}