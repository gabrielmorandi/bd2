// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { deleteCookie, setSignedCookie } from 'hono/cookie';
// middlewares
import { authMiddleware } from '../middlewares';
// types
import { MessageResponse } from '../types';
// config
import { AUTH_CONFIG } from '../config';
// valueObjects
import { UserAuthInbound, UserAuthValueObject } from '../valueObjects';
// services
import { AuthService, DbService } from '../services';
// utils
import { Logger } from '../utils';
import { validateContentType, validateJsonContent } from '../validators';
import { validator } from 'hono/validator';

export const auth = new Hono();

auth.post(
    '/login',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<UserAuthInbound>(UserAuthValueObject)),
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const _auth = new AuthService(_db);

            const loginData = await _auth.login(payload.email, payload.password);
            if (!loginData) {
                return c.json(
                    {
                        success: false,
                        message: 'Falha ao fazer login. Tente novamente.'
                    } as MessageResponse,
                    StatusCodes.UNAUTHORIZED
                );
            }

            await setSignedCookie(
                c,
                AUTH_CONFIG.COOKIES.ACCESS_TOKEN,
                loginData.accessToken,
                process.env.COOKIE_SECRET,
                AUTH_CONFIG.COOKIE_OPTIONS
            );

            await setSignedCookie(
                c,
                AUTH_CONFIG.COOKIES.REFRESH_TOKEN,
                loginData.refreshToken,
                process.env.COOKIE_SECRET,
                {
                    ...AUTH_CONFIG.COOKIE_OPTIONS,
                    maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY
                }
            );

            return c.json({ success: true }, StatusCodes.OK);
        } catch (error) {
            Logger.error('Error /v1/auth/ -> post(/login): ', error);
            return c.json(
                {
                    success: false,
                    message: 'Falha inesperada.'
                } as MessageResponse,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
);

auth.post('/logout', async (c) => {
    deleteCookie(c, AUTH_CONFIG.COOKIES.ACCESS_TOKEN, { path: '/' });
    deleteCookie(c, AUTH_CONFIG.COOKIES.REFRESH_TOKEN, { path: '/' });

    return c.json(
        {
            success: true,
            message: 'Logout realizado com sucesso.'
        } as MessageResponse,
        StatusCodes.OK
    );
});

auth.get('/me', authMiddleware, async (c) => {
    const user = c.get('user');

    return c.json({
        success: true,
        data: user
    });
});
