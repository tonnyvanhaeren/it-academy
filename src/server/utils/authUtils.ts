import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import Cookies from 'js-cookie';
import 'dotenv/config';

// Types
type UserRole = 'student' | 'teacher' | 'admin';

interface AccessTokenPayload extends JWTPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}

interface RefreshTokenPayload extends JWTPayload {
  sub: string; // userId
}

// Secrets
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Cookie opties
const getCookieOptions = (expiresInDays: number) => ({
  expires: expiresInDays,
  secure: IS_PRODUCTION,
  sameSite: 'strict' as const,
  httpOnly: IS_PRODUCTION,
  path: '/',
});

// --- Token functies ---
export const createAccessToken = async (
  userId: string,
  email: string,
  role: UserRole
): Promise<string> => {
  return new SignJWT({ sub: userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_TOKEN_SECRET);
};

export const createRefreshToken = async (userId: string): Promise<string> => {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_TOKEN_SECRET);
};

// --- Token verificatie ---
export const verifyAccessToken = async (token: string): Promise<{ success: boolean; payload?: AccessTokenPayload; reason?: string }> => {
  try {
    const { payload } = await jwtVerify<AccessTokenPayload>(token, ACCESS_TOKEN_SECRET);
    return { success: true, payload };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JWTExpired') {
        return { success: false, reason: 'expired' };
      } else if (error.name === 'JWTSignatureVerificationFailed') {
        return { success: false, reason: 'invalid_signature' };
      } else {
        return { success: false, reason: 'invalid_token' };
      }
    }
    return { success: false, reason: 'unknown_error' };
  }
};

export const verifyRefreshToken = async (token: string): Promise<{ success: boolean; payload?: RefreshTokenPayload; reason?: string }> => {
  try {
    const { payload } = await jwtVerify<RefreshTokenPayload>(token, REFRESH_TOKEN_SECRET);
    return { success: true, payload };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JWTExpired') {
        return { success: false, reason: 'expired' };
      } else if (error.name === 'JWTSignatureVerificationFailed') {
        return { success: false, reason: 'invalid_signature' };
      } else {
        return { success: false, reason: 'invalid_token' };
      }
    }
    return { success: false, reason: 'unknown_error' };
  }
};

// --- Cookie functies ---
export const setAuthCookies = (accessToken: string, refreshToken: string): void => {
  Cookies.set('accessToken', accessToken, getCookieOptions(15 / (60 * 24))); // 15 min
  Cookies.set('refreshToken', refreshToken, getCookieOptions(7)); // 7 dagen
  console.log('COOKIES')
};

export const clearAuthCookies = (): void => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
};

export const getAccessToken = (): string | undefined => Cookies.get('accessToken');
export const getRefreshToken = (): string | undefined => Cookies.get('refreshToken');

// --- Token Refresh Flow ---
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const verification = await verifyRefreshToken(refreshToken);
  if (!verification.success || !verification.payload) {
    clearAuthCookies();
    return null;
  }

  try {
    // 1. Haal gebruikersdata op (in een echte app: uit je database)
    // Voorbeeld: const user = await db.getUser(verification.payload.sub);
    const user = { id: verification.payload.sub, email: 'antonius@example.com', role: 'teacher' as UserRole };

    // 2. Maak nieuwe access token
    const newAccessToken = await createAccessToken(user.id, user.email, user.role);

    // 3. Update access token cookie
    Cookies.set('accessToken', newAccessToken, getCookieOptions(15 / (60 * 24)));
    return newAccessToken;
  } catch (error) {
    console.error('Refresh failed:', error);
    clearAuthCookies();
    return null;
  }
};
