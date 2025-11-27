// zod
import { z } from 'zod';
// valueObjects
import { BoardOutboundSchema } from './board';
import { ColumnOutboundSchema } from './column';
import { TaskOutboundSchema } from './task';
import { SubtaskOutboundSchema } from './subtask';
import { UserOutboundSchema } from './user';

const TaskComplexOutboundSchema = TaskOutboundSchema.extend({
    subtasks: z.array(SubtaskOutboundSchema),
    assignees: z.array(UserOutboundSchema)
});

const ColumnComplexOutboundSchema = ColumnOutboundSchema.extend({
    tasks: z.array(TaskComplexOutboundSchema)
});

export const BoardComplexOutboundSchema = BoardOutboundSchema.extend({
    columns: z.array(ColumnComplexOutboundSchema),
    members: z.array(UserOutboundSchema),
    owner: UserOutboundSchema
});

export type TaskComplexOutbound = z.infer<typeof TaskComplexOutboundSchema>;
export type ColumnComplexOutbound = z.infer<typeof ColumnComplexOutboundSchema>;
export type BoardComplexOutbound = z.infer<typeof BoardComplexOutboundSchema>;

export class BoardComplexValueObject {
    static createOutbound(data: unknown): BoardComplexOutbound {
        return BoardComplexOutboundSchema.parse(data);
    }
}
