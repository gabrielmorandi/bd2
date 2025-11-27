// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { ColumnInbound, ColumnOutbound, ColumnValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const columns = new Hono();

// posts
columns.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<ColumnInbound>(ColumnValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdColumn = await _db.createColumn(payload);

            return c.json({
                success: true,
                data: createdColumn
            } as DataResponse<ColumnOutbound>);
        } catch (error) {
            Logger.error('Error /v1/column -> post(/): ', error);
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

columns.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedColumn = await _db.getColumnsByBoard(id);

        return c.json({
            success: true,
            data: queriedColumn
        } as DataResponse<Array<ColumnOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/column -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

columns.put(
    '/id/:id',
    validator('param', validateParamIsUuid('id')),
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<ColumnInbound>(ColumnValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const id = c.req.valid('param');
            const payload = c.req.valid('json');
            const _db = new DbService();
            const updatedColumn = await _db.updateColumnByColumnId(id, payload);

            return c.json({
                success: true,
                data: updatedColumn
            } as DataResponse<ColumnOutbound>);
        } catch (error) {
            Logger.error('Error /v1/column -> put(/id/:id): ', error);
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
columns.delete('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const deletedColumn = await _db.deleteColumnByColumnId(id);

        return c.json({
            success: true,
            data: deletedColumn
        } as DataResponse<ColumnOutbound>);
    } catch (error) {
        Logger.error('Error /v1/column -> delete(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
