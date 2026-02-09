import { jwtVerify, SignJWT, JWTPayload, errors } from "jose";
import { HttpError } from "../errors/http-error";


// Milieuvariabelen (gebruik dotenv in productie!)
const JWT_SECRET_REFRESH = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)
const JWT_SECRET_ACCESS = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
const JWT_ACCESS_EXP = '15m' // 15 minuten
const JWT_REFRESH_EXP = '7d'  // 7 dagen
const NOW = Math.floor(Date.now() / 1000); // seconds

type Role = 'student' | 'teacher' | 'admin'

interface MyPayload extends JWTPayload {
  email: string;
  userId: string;
  role: Role; // your custom claim
}

// Functies om een access en refresh JWT te genereren
export async function signAccessToken(payload: { sub: string, email: string, role: string }) {

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(NOW)
    .setExpirationTime(JWT_ACCESS_EXP)
    .sign(JWT_SECRET_ACCESS)
}

export async function signRefreshToken(payload: { sub: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(NOW)
    .setExpirationTime(JWT_REFRESH_EXP)
    .sign(JWT_SECRET_REFRESH)
}

export async function verifyAccessToken(accessToken: string) {
  try {
    const { payload } = await jwtVerify<MyPayload>(accessToken, JWT_SECRET_ACCESS, {
      algorithms: ['HS256']
    });

    return payload;

  } catch (err) {
    if (err instanceof errors.JWSSignatureVerificationFailed) {
      // logging somebody is trying access-token with bad secret
    }

    throw new HttpError("Invalid access-token", {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
}

export async function verifyRefreshToken(refreshToken: string) {
  try {
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET_REFRESH, {
      algorithms: ['HS256']
    });
    const user = payload as { sub: string, exp: number }

    return payload;

  } catch (err) {
    if (err instanceof errors.JWSSignatureVerificationFailed) {
      // logging somebody is trying refresh-token with bad secret
    }

    throw new HttpError("Invalid refresh-token", {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
}
