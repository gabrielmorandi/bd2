import 'dotenv/config';
// hono
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { StatusCodes } from 'http-status-codes';
// middlewares
import { corsMiddleware, statsMiddleware } from './middlewares';
// router
import router from './routes';
// utils
import { customLogger } from './utils';
import { initDatabase } from './database/connection';

const app = new Hono();

// logger
app.use('*', logger(customLogger));

// databse
initDatabase();

// cors
app.use('*', corsMiddleware());

// api stats
app.on('GET', ['/', '/v1'], statsMiddleware());

// options
app.options('*', (c) => {
    c.status(StatusCodes.NO_CONTENT);
    return c.body('');
});

// router
app.route('/v1', router);

serve({
    fetch: app.fetch,
    port: 8787,
    hostname: '0.0.0.0'
});

console.log('API rodando em http://localhost:8787');
