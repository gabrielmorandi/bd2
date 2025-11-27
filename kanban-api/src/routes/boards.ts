// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { BoardInbound, BoardOutbound, BoardValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const boards = new Hono();

// posts
boards.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<BoardInbound>(BoardValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdBoard = await _db.createBoard(payload);

            return c.json({
                success: true,
                data: createdBoard
            } as DataResponse<BoardOutbound>);
        } catch (error) {
            Logger.error('Error /v1/board -> post(/): ', error);
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

boards.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedBoards = await _db.getAllBoardsByOwner(id);

        return c.json({
            success: true,
            data: queriedBoards
        } as DataResponse<Array<BoardOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/board -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

boards.put(
    '/id/:id',
    validator('param', validateParamIsUuid('id')),
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<BoardInbound>(BoardValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const id = c.req.valid('param');
            const payload = c.req.valid('json');
            const _db = new DbService();
            const updatedBoard = await _db.updateBoardByBoardId(id, payload);

            return c.json({
                success: true,
                data: updatedBoard
            } as DataResponse<BoardOutbound>);
        } catch (error) {
            Logger.error('Error /v1/board -> put(/id/:id): ', error);
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
boards.delete('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const deletedBoard = await _db.deleteBoardByBoardId(id);

        return c.json({
            success: true,
            data: deletedBoard
        } as DataResponse<BoardOutbound>);
    } catch (error) {
        Logger.error('Error /v1/board -> delete(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
