// zod
import { z } from 'zod';
// valueObjects
import { UserOutboundSchema } from '.';

export const UserAuthInboundSchema = z.object({
    email: z.string(),
    password: z.string()
});
export const UserAuthOutboundSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string()
});
export const LoginOutboundSchema = z.object({
    user: UserOutboundSchema,
    accessToken: z.string(),
    refreshToken: z.string()
});

export type UserAuthInbound = z.infer<typeof UserAuthInboundSchema>;
export type UserAuthOutbound = z.infer<typeof UserAuthOutboundSchema>;
export type LoginOutbound = z.infer<typeof LoginOutboundSchema>;

export class UserAuthValueObject {
    static createInbound(data: unknown): UserAuthInbound {
        return UserAuthInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof UserAuthInboundSchema.safeParse> {
        return UserAuthInboundSchema.safeParse(data);
    }

    static createAuthOutbound(data: unknown): UserAuthOutbound {
        return UserAuthOutboundSchema.parse(data);
    }

    static createLoginOutbound(data: unknown): LoginOutbound {
        return LoginOutboundSchema.parse(data);
    }
}
