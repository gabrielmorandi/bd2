// zod
import { z } from 'zod';

// schemas
export const UserInboundSchema = z.object({
    name: z.string().nonempty(),
    email: z.email().nonempty().toLowerCase(),
    password_hash: z.string().nonempty(),
    avatar_url: z.string().nullable()
});
export const UserOutboundSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    avatar_url: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
});
export const UserOutboundWithPasswordHashSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar_url: z.string().nullable(),
    password_hash: z.string(),
    created_at: z.string(),
    updated_at: z.string()
});

// types
export type UserInbound = z.infer<typeof UserInboundSchema>;
export type UserOutbound = z.infer<typeof UserOutboundSchema>;
export type UserOutboundWithPasswordHash = z.infer<typeof UserOutboundWithPasswordHashSchema>;

// valueObject
export class UserValueObject {
    static createInbound(data: unknown): UserInbound {
        return UserInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof UserInboundSchema.safeParse> {
        return UserInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): UserOutbound {
        return UserOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<UserOutbound> {
        return z.array(UserOutboundSchema).parse(data);
    }

    static createOutboundWithPasswordHash(data: unknown): UserOutboundWithPasswordHash {
        return UserOutboundWithPasswordHashSchema.parse(data);
    }
}
