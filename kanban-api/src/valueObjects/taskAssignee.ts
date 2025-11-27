// zod
import { z } from 'zod';

// schemas
export const TaskAssigneeInboundSchema = z.object({
    task_id: z.string().nonempty(),
    user_id: z.string().nonempty()
});

export const TaskAssigneeOutboundSchema = z.object({
    task_id: z.string(),
    user_id: z.string()
});

// types
export type TaskAssigneeInbound = z.infer<typeof TaskAssigneeInboundSchema>;
export type TaskAssigneeOutbound = z.infer<typeof TaskAssigneeOutboundSchema>;

// valueObject
export class TaskAssigneeValueObject {
    static createInbound(data: unknown): TaskAssigneeInbound {
        return TaskAssigneeInboundSchema.parse(data);
    }
    static createSafeInbound(data: unknown): ReturnType<typeof TaskAssigneeInboundSchema.safeParse> {
        return TaskAssigneeInboundSchema.safeParse(data);
    }

    static createOutbound(data: unknown): TaskAssigneeOutbound {
        return TaskAssigneeOutboundSchema.parse(data);
    }
    static createOutboundArray(data: unknown): Array<TaskAssigneeOutbound> {
        return z.array(TaskAssigneeOutboundSchema).parse(data);
    }
}
