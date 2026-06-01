import { UAParser } from "ua-parser-js";
import { authUser } from "./node.function.js";

export async function login(req, res){
      const {email, password} = req.body;
      console.log(email, password);
    
    if(!email || !password) return;
    const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;

    const parser = new UAParser(req.headers['user-agent']);

    const result = parser.getResult();

    const deviceName =
    `${result.browser.name} on ${result.os.name}`;

    const tokens = await authUser(email, password, ip, deviceName);
    if (!tokens) {
        return res.status(401).json({
            message: 'Ungültige Zugangsdaten'
        });
    }


     res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15 // 15 Minuten
    });

    // Refresh Token
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 Tage
    });

    res.json({ ok: true });
}