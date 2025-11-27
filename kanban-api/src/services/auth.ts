// hono
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { v7 as uuidv7 } from 'uuid';
// services
import { DbService } from './database';
// config
import { AUTH_CONFIG } from '../config';
// types
import type { FullPayload } from '../types';
// valueObjects
import { LoginOutbound, UserAuthOutbound, UserAuthValueObject } from '../valueObjects';

export class AuthService {
    constructor(
        private db: DbService,
        private accessSecret = process.env.ACCESS_SECRET,
        private refreshSecret = process.env.REFRESH_SECRET
    ) {}

    private async generateAccessToken(user: UserAuthOutbound): Promise<string> {
        const payload = {
            ...user,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
            jti: uuidv7()
        } as FullPayload;
        return await sign(payload, this.accessSecret);
    }

    private async generateRefreshToken(user: UserAuthOutbound): Promise<string> {
        const payload = {
            ...user,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY,
            jti: uuidv7()
        } as FullPayload;
        return await sign(payload, this.refreshSecret);
    }

    async login(email: string, password: string): Promise<LoginOutbound | null> {
        const user = await this.db.getUserByEmailWithPasswordHash(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return null;
        }

        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);

        return UserAuthValueObject.createLoginOutbound({
            user,
            accessToken,
            refreshToken
        });
    }
}
