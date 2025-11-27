// hono
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { DataResponse, MessageResponse } from '../types/responses';
// services
import { DbService } from '../services';
// valueObjects
import { UserInbound, UserOutbound, UserValueObject } from '../valueObjects';
// utils
import { Logger } from '../utils';
import { validator } from 'hono/validator';
import { validateJsonContent, validateContentType, validateParamIsEmail } from '../validators';

export const users = new Hono();

// posts
users.post(
    '/',
    validator('header', validateContentType('application/json')),
    validator('json', validateJsonContent<UserInbound>(UserValueObject)),
    async (c) => {
        try {
            const payload = c.req.valid('json');
            const _db = new DbService();
            const createdUser = await _db.createUser(payload);

            return c.json({
                success: true,
                data: createdUser
            } as DataResponse<UserOutbound>);
        } catch (error) {
            Logger.error('Error /v1/users -> post(/): ', error);
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

// gets
users.get('/:email', validator('param', validateParamIsEmail('email')), async (c) => {
    try {
        const email = c.req.valid('param');
        const _db = new DbService();
        const queryUser = await _db.getUserByEmail(email);

        if (!queryUser)
            return c.json(
                {
                    success: true,
                    message: 'Usuário não encontrado'
                } as MessageResponse,
                StatusCodes.NOT_FOUND
            );

        return c.json(
            {
                success: true,
                data: queryUser
            } as DataResponse<UserOutbound>,
            StatusCodes.OK
        );
    } catch (error) {
        Logger.error('Error /v1/users -> get(/): ', error);
        return c.json(
            {
                success: false,
                message: 'Falha inesperada.'
            } as MessageResponse,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
});
