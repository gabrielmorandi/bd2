// zod
import { z } from 'zod';

// schemas
export const SubtaskInboundSchema = z.object({
    title: z.string().nonempty(),
    task_id: z.string().nonempty(),
    is_completed: z.boolean(),
    position: z.number()
});
export const SubtaskOutboundSchema = z.object({
    id: z.string(),
    title: z.string(),
    task_id: z.string(),
    is_completed: z.boolean(),
    position: z.number(),
    created_at: z.string()
});

// types
export type SubtaskInbound = z.infer<typeof SubtaskInboundSchema>;
export type SubtaskOutbound = z.infer<typeof SubtaskOutboundSchema>;

// valueObject
export class SubtaskValueObject {
    static createInbound(data: unknown): SubtaskInbound {
        return SubtaskInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof SubtaskInboundSchema.safeParse> {
        return SubtaskInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): SubtaskOutbound {
        return SubtaskOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<SubtaskOutbound> {
        return z.array(SubtaskOutboundSchema).parse(data);
    }
}
