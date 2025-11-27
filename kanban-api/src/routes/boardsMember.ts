// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { BoardMemberInbound, BoardMemberOutbound, BoardMemberValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsUuid } from '../validators';
import { authMiddleware } from '../middlewares';

export const boardsMembers = new Hono();

// posts
boardsMembers.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<BoardMemberInbound>(BoardMemberValueObject)),
    authMiddleware,
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdBoardMember = await _db.addBoardMember(payload);

            return c.json({
                success: true,
                data: createdBoardMember
            } as DataResponse<BoardMemberOutbound>);
        } catch (error) {
            Logger.error('Error /v1/boards/members -> post(/): ', error);
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

boardsMembers.get('/id/:id', validator('param', validateParamIsUuid('id')), authMiddleware, async (c) => {
    try {
        const id = c.req.valid('param');
        const _db = new DbService();
        const queriedBoardMembers = await _db.getMembersByBoardId(id);

        return c.json({
            success: true,
            data: queriedBoardMembers
        } as DataResponse<Array<BoardMemberOutbound>>);
    } catch (error) {
        Logger.error('Error /v1/boards/members -> get(/id/:id): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});

boardsMembers.delete(
    '/id/:id/user/:userId',
    validator('param', validateParamIsUuid('id')),
    validator('param', validateParamIsUuid('userId')),
    authMiddleware,
    async (c) => {
        try {
            const { id, userId } = c.req.param();
            const _db = new DbService();
            const deletedBoardMember = await _db.removeBoardMemberByBoardId(id, userId);

            return c.json({
                success: true,
                data: deletedBoardMember
            } as DataResponse<BoardMemberOutbound>);
        } catch (error) {
            Logger.error('Error /v1/boards/members -> delete(/id/:id): ', error);
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
