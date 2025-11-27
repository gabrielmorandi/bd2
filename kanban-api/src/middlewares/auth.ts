// hono
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';
import { v7 as uuidv7 } from 'uuid';
// types
import { MessageResponse } from '../types/responses';
import { FullPayload, VerifiedToken } from '../types';
// valueObject
import { UserAuthOutbound, UserAuthValueObject } from '../valueObjects';
// config
import { AUTH_CONFIG } from '../config';

type AppVariables = {
    user: UserAuthOutbound;
};

export const authMiddleware = createMiddleware<{
    Variables: AppVariables;
}>(async (c, next) => {
    const accessToken = await getAccessToken(c);
    const refreshToken = await getRefreshToken(c);

    if (!accessToken && !refreshToken) {
        return c.json<MessageResponse>(
            { success: false, message: 'Autenticação necessária. Faça login para continuar.' },
            StatusCodes.UNAUTHORIZED
        );
    }

    let user: UserAuthOutbound | null = null;

    if (accessToken && refreshToken) {
        const result = await verifyAccessTokenSafe(accessToken);
        if (result) {
            const userData = result.userData;
            if (shouldRenewProactively(result.payload.exp || 0)) {
                await attemptProactiveRenewal(c, userData, refreshToken);
            }
            user = userData;
        }
    }

    if (refreshToken && !accessToken) {
        const renewed = await renewAccessToken(c, refreshToken).catch(() => null);
        user = renewed;
    }

    if (!user) {
        return c.json<MessageResponse>(
            { success: false, message: 'Não foi possível autenticar o usuário.' },
            StatusCodes.UNAUTHORIZED
        );
    }

    c.set('user', user);
    await next();
});

async function getCookie(c: Context, name: string): Promise<string | null> {
    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret) {
        throw new Error('COOKIE_SECRET não configurado');
    }

    const cookie = await getSignedCookie(c, cookieSecret, name);
    if (!cookie) return null;
    return cookie;
}

async function getAccessToken(c: Context): Promise<string | null> {
    const accessToken = await getCookie(c, AUTH_CONFIG.COOKIES.ACCESS_TOKEN);
    if (!accessToken) return null;
    return accessToken;
}

async function getRefreshToken(c: Context): Promise<string | null> {
    const refreshToken = await getCookie(c, AUTH_CONFIG.COOKIES.REFRESH_TOKEN);
    if (!refreshToken) return null;
    return refreshToken;
}

async function verifyAccessTokenSafe(token: string): Promise<VerifiedToken | null> {
    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) {
        throw new Error('ACCESS_SECRET não configurado');
    }

    const decoded = await verify(token, accessSecret).catch(() => null);
    if (!decoded) return null;

    const parsedUserAuth = UserAuthValueObject.createAuthOutbound(decoded as unknown);
    if (!parsedUserAuth) return null;

    return {
        userData: parsedUserAuth,
        payload: decoded as JWTPayload
    };
}

function shouldRenewProactively(tokenExp: number): boolean {
    const timeUntilExpiry = tokenExp - Math.floor(Date.now() / 1000);
    return timeUntilExpiry < AUTH_CONFIG.REFRESH_PROACTIVE_THRESHOLD && timeUntilExpiry > 0;
}

function createJWTPayload(userData: UserAuthOutbound, expiryTime: number): FullPayload {
    return {
        ...userData,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiryTime,
        jti: uuidv7()
    };
}

async function setAccessTokenCookie(c: Context, token: string): Promise<void> {
    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret) {
        throw new Error('COOKIE_SECRET não configurado');
    }

    await setSignedCookie(
        c,
        AUTH_CONFIG.COOKIES.ACCESS_TOKEN,
        token,
        cookieSecret,
        AUTH_CONFIG.COOKIE_OPTIONS
    );
}

async function setRefreshTokenCookie(c: Context, token: string): Promise<void> {
    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret) {
        throw new Error('COOKIE_SECRET não configurado');
    }

    await setSignedCookie(c, AUTH_CONFIG.COOKIES.REFRESH_TOKEN, token, cookieSecret, {
        ...AUTH_CONFIG.COOKIE_OPTIONS,
        maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY
    });
}

async function attemptProactiveRenewal(
    c: Context,
    userData: UserAuthOutbound,
    refreshToken: string | undefined
): Promise<void> {
    if (!refreshToken) return;

    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) return;

    const isValid = await verify(refreshToken, refreshSecret).catch(() => null);
    if (!isValid) return;

    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) return;

    const payload = createJWTPayload(userData, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
    const newAccessToken = await sign(payload, accessSecret);
    await setAccessTokenCookie(c, newAccessToken);
}

async function renewAccessToken(c: Context, refreshToken: string): Promise<UserAuthOutbound> {
    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) {
        throw new Error('REFRESH_SECRET não configurado');
    }

    const decoded = await verify(refreshToken, refreshSecret).catch(() => null);
    if (!decoded) throw new Error('Refresh inválido');

    const userData = UserAuthValueObject.createAuthOutbound(decoded as unknown);

    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) {
        throw new Error('ACCESS_SECRET não configurado');
    }

    const accessPayload = createJWTPayload(userData, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY);
    const newAccessToken = await sign(accessPayload, accessSecret);

    const refreshPayload = createJWTPayload(userData, AUTH_CONFIG.REFRESH_TOKEN_EXPIRY);
    const newRefreshToken = await sign(refreshPayload, refreshSecret);

    await setAccessTokenCookie(c, newAccessToken);
    await setRefreshTokenCookie(c, newRefreshToken);

    return userData;
}
