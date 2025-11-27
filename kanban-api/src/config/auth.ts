export const AUTH_CONFIG = {
    ACCESS_TOKEN_EXPIRY: 5 * 60 * 60, // 5hrs
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 dias
    REFRESH_PROACTIVE_THRESHOLD: 30 * 60, // 30min

    COOKIES: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token'
    },

    COOKIE_OPTIONS: {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'Strict' as const,
        priority: 'High' as const
    }
} as const;
