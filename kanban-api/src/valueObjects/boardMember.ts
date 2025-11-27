// zod
import { z } from 'zod';

// schemas
export const BoardMemberInboundSchema = z.object({
    board_id: z.string().nonempty(),
    user_id: z.string().nonempty()
});

export const BoardMemberOutboundSchema = z.object({
    board_id: z.string(),
    user_id: z.string(),
    joined_at: z.string()
});

// types
export type BoardMemberInbound = z.infer<typeof BoardMemberInboundSchema>;
export type BoardMemberOutbound = z.infer<typeof BoardMemberOutboundSchema>;

// valueObject
export class BoardMemberValueObject {
    static createInbound(data: unknown): BoardMemberInbound {
        return BoardMemberInboundSchema.parse(data);
    }

    static createSafeInbound(data: unknown): ReturnType<typeof BoardMemberInboundSchema.safeParse> {
        return BoardMemberInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): BoardMemberOutbound {
        return BoardMemberOutboundSchema.parse(data);
    }

    static createOutboundArray(data: unknown): Array<BoardMemberOutbound> {
        return z.array(BoardMemberOutboundSchema).parse(data);
    }
}
