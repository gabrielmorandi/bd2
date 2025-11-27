import type { JWTPayload } from 'hono/utils/jwt/types';
import type { UserAuthOutbound } from '../valueObjects';

export type FullPayload = JWTPayload & UserAuthOutbound;

export type VerifiedToken = {
    userData: UserAuthOutbound;
    payload: JWTPayload;
};
