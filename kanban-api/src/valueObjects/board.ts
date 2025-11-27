// zod
import { z } from 'zod';

// schemas
export const BoardInboundSchema = z.object({
    name: z.string().nonempty(),
    owner_id: z.string().nonempty()
});
export const BoardOutboundSchema = z.object({
    id: z.string(),
    name: z.string(),
    owner_id: z.string(),
    created_at: z.string(),
    updated_at: z.string()
});

// types
export type BoardInbound = z.infer<typeof BoardInboundSchema>;
export type BoardOutbound = z.infer<typeof BoardOutboundSchema>;

// valueObject
export class BoardValueObject {
    static createInbound(data: unknown): BoardInbound {
        return BoardInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof BoardInboundSchema.safeParse> {
        return BoardInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): BoardOutbound {
        return BoardOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<BoardOutbound> {
        return z.array(BoardOutboundSchema).parse(data);
    }
}
