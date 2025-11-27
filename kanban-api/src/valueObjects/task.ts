// zod
import { z } from 'zod';

// schemas
export const TaskInboundSchema = z.object({
    title: z.string().nonempty(),
    description: z.string(),
    column_id: z.string().nonempty()
});
export const TaskOutboundSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    column_id: z.string(),
    created_at: z.string(),
    updated_at: z.string()
});

// types
export type TaskInbound = z.infer<typeof TaskInboundSchema>;
export type TaskOutbound = z.infer<typeof TaskOutboundSchema>;

// valueObject
export class TaskValueObject {
    static createInbound(data: unknown): TaskInbound {
        return TaskInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof TaskInboundSchema.safeParse> {
        return TaskInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): TaskOutbound {
        return TaskOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<TaskOutbound> {
        return z.array(TaskOutboundSchema).parse(data);
    }
}
