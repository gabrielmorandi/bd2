// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { BoardComplexOutbound } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateParamIsUuid } from '../validators';
// middleware
import { authMiddleware } from '../middlewares';

export const complex = new Hono();

complex.get('/board/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedComplexBoard = await _db.getBoardComplexById(id);

        return c.json({
            success: true,
            data: queriedComplexBoard
        } as DataResponse<BoardComplexOutbound>);
    } catch (error) {
        Logger.error('Error /v1/complex -> get(board/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
