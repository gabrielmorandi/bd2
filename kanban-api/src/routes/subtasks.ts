// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { SubtaskInbound, SubtaskOutbound, SubtaskValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const subtasks = new Hono();

// posts
subtasks.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<SubtaskInbound>(SubtaskValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdSubtask = await _db.createSubtask(payload);

            return c.json({
                success: true,
                data: createdSubtask
            } as DataResponse<SubtaskOutbound>);
        } catch (error) {
            Logger.error('Error /v1/subtasks -> post(/): ', error);
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

subtasks.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedSubtasks = await _db.getSubtasksByTask(id);

        return c.json({
            success: true,
            data: queriedSubtasks
        } as DataResponse<Array<SubtaskOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/subtasks -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

subtasks.put(
    '/id/:id',
    validator('param', validateParamIsUuid('id')),
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<SubtaskInbound>(SubtaskValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const id = c.req.valid('param');
            const payload = c.req.valid('json');
            const _db = new DbService();
            const updatedSubtask = await _db.updateSubtaskById(id, payload);

            return c.json({
                success: true,
                data: updatedSubtask
            } as DataResponse<SubtaskOutbound>);
        } catch (error) {
            Logger.error('Error /v1/subtasks -> put(/id/:id): ', error);
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
subtasks.delete('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const deletedSubtask = await _db.deleteSubtaskById(id);

        return c.json({
            success: true,
            data: deletedSubtask
        } as DataResponse<SubtaskOutbound>);
    } catch (error) {
        Logger.error('Error /v1/subtasks -> delete(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
