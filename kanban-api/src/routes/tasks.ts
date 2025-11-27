// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { TaskInbound, TaskOutbound, TaskValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const tasks = new Hono();

// posts
tasks.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<TaskInbound>(TaskValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdTask = await _db.createTask(payload);

            return c.json({
                success: true,
                data: createdTask
            } as DataResponse<TaskOutbound>);
        } catch (error) {
            Logger.error('Error /v1/tasks -> post(/): ', error);
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

tasks.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedTasks = await _db.getTasksByColumnId(id);

        return c.json({
            success: true,
            data: queriedTasks
        } as DataResponse<Array<TaskOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/tasks -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

tasks.put(
    '/id/:id',
    validator('param', validateParamIsUuid('id')),
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<TaskInbound>(TaskValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const id = c.req.valid('param');
            const payload = c.req.valid('json');
            const _db = new DbService();
            const updatedTask = await _db.updateTaskById(id, payload);

            return c.json({
                success: true,
                data: updatedTask
            } as DataResponse<TaskOutbound>);
        } catch (error) {
            Logger.error('Error /v1/tasks -> put(/id/:id): ', error);
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
tasks.delete('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const deletedTask = await _db.deleteTaskById(id);

        return c.json({
            success: true,
            data: deletedTask
        } as DataResponse<TaskOutbound>);
    } catch (error) {
        Logger.error('Error /v1/tasks -> delete(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
