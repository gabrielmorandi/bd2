// hono
import type { MiddlewareHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse } from '../types/responses';

export function statsMiddleware(): MiddlewareHandler {
    return async (c) => {
        return c.json(
            {
                success: true,
                data: {
                    name: 'Kanban API',
                    version: 'v1',
                    status: 'operational'
                }
            } as DataResponse<any>,
            StatusCodes.OK
        );
    };
}
