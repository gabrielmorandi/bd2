// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { TaskAssigneeInbound, TaskAssigneeOutbound, TaskAssigneeValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const tasksAssignees = new Hono();

// posts
tasksAssignees.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<TaskAssigneeInbound>(TaskAssigneeValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdTaskAssignee = await _db.addTaskAssignee(payload);

            return c.json({
                success: true,
                data: createdTaskAssignee
            } as DataResponse<TaskAssigneeOutbound>);
        } catch (error) {
            Logger.error('Error /v1/tasks/assignees -> post(/): ', error);
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

tasksAssignees.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedTasksAssignee = await _db.getAssigneesByTaskId(id);

        return c.json({
            success: true,
            data: queriedTasksAssignee
        } as DataResponse<Array<TaskAssigneeOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/tasks/assignees -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

tasksAssignees.delete(
    '/id/:id/user/:userId',
    validator('param', validateParamIsUuid('id')),
    validator('param', validateParamIsUuid('userId')),
    authMiddleware,
    async (c) => {
        try {
            const { id, userId } = c.req.param();

            const _db = new DbService();
            const deletedTaskAssignee = await _db.removeTaskAssigneeByTaskId(id, userId);

            return c.json({
                success: true,
                data: deletedTaskAssignee
            } as DataResponse<TaskAssigneeOutbound>);
        } catch (error) {
            Logger.error('Error /v1/tasks/assignees -> delete(/id/:id): ', error);
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
