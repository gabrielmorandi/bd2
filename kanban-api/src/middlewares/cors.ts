// hono
import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export function corsMiddleware(): MiddlewareHandler {
    return (c, next) => {
        const isProduction = process.env.PRODUCTION === 'true';

        if (isProduction) {
            return cors({
                allowHeaders: ['Content-Type'],
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                maxAge: 600,
                origin: (origin) => {
                    const allowedOrigins = [
                        'https://kanban-front.gabriel-morandi.workers.dev/',
                        'https://www.kanban-front.gabriel-morandi.workers.dev/'
                    ];
                    return allowedOrigins.includes(origin) ? origin : null;
                },
                credentials: true
            })(c, next);
        } else {
            return cors({
                allowHeaders: ['Content-Type'],
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                maxAge: 600,
                origin: (origin) => {
                    const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
                    return allowedOrigins.includes(origin) ? origin : '*';
                },
                credentials: true
            })(c, next);
        }
    };
}
