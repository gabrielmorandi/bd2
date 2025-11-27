// zod
import { z } from 'zod';

// schemas
export const ColumnInboundSchema = z.object({
    name: z.string().nonempty(),
    board_id: z.string().nonempty()
});
export const ColumnOutboundSchema = z.object({
    id: z.string(),
    name: z.string(),
    board_id: z.string(),
    created_at: z.string(),
    updated_at: z.string()
});

// types
export type ColumnInbound = z.infer<typeof ColumnInboundSchema>;
export type ColumnOutbound = z.infer<typeof ColumnOutboundSchema>;

// valueObject
export class ColumnValueObject {
    static createInbound(data: unknown): ColumnInbound {
        return ColumnInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof ColumnInboundSchema.safeParse> {
        return ColumnInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): ColumnOutbound {
        return ColumnOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<ColumnOutbound> {
        return z.array(ColumnOutboundSchema).parse(data);
    }
}
