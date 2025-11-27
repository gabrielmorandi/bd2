// drizzle
import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';

// schema
export const users = sqliteTable('users', {
    id: text()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text().notNull(),
    email: text().notNull().unique(),
    avatar_url: text(),
    password_hash: text().notNull(),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text()
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export const boards = sqliteTable('boards', {
    id: text()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text().notNull(),
    owner_id: text()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text()
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export const columns = sqliteTable('columns', {
    id: text()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text().notNull(),
    board_id: text()
        .notNull()
        .references(() => boards.id, { onDelete: 'cascade' }),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text()
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export const tasks = sqliteTable('tasks', {
    id: text()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    title: text().notNull(),
    description: text(),
    column_id: text()
        .notNull()
        .references(() => columns.id, { onDelete: 'cascade' }),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text()
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export const subtasks = sqliteTable('subtasks', {
    id: text()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    title: text().notNull(),
    task_id: text()
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    is_completed: integer({ mode: 'boolean' }).notNull().default(false),
    position: integer().notNull().default(0),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
    completed_at: text()
});

export const taskAssignees = sqliteTable(
    'task_assignees',
    {
        task_id: text()
            .notNull()
            .references(() => tasks.id, { onDelete: 'cascade' }),
        user_id: text()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' })
    },
    (t) => ({
        pk: primaryKey({ columns: [t.task_id, t.user_id] })
    })
);

export const boardMembers = sqliteTable(
    'board_members',
    {
        board_id: text()
            .notNull()
            .references(() => boards.id, { onDelete: 'cascade' }),
        user_id: text()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        joined_at: text().default(sql`CURRENT_TIMESTAMP`)
    },
    (t) => ({
        pk: primaryKey({ columns: [t.board_id, t.user_id] })
    })
)

// relations
export const usersRelations = relations(users, ({ many }) => ({
    ownedBoards: many(boards),
    taskAssignees: many(taskAssignees),
    boardMembers: many(boardMembers)
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
    owner: one(users, {
        fields: [boards.owner_id],
        references: [users.id]
    }),
    columns: many(columns),
    boardMembers: many(boardMembers)
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
    board: one(boards, {
        fields: [columns.board_id],
        references: [boards.id]
    }),
    tasks: many(tasks)
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
    column: one(columns, {
        fields: [tasks.column_id],
        references: [columns.id]
    }),
    subtasks: many(subtasks),
    taskAssignees: many(taskAssignees)
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
    task: one(tasks, {
        fields: [subtasks.task_id],
        references: [tasks.id]
    })
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
    task: one(tasks, {
        fields: [taskAssignees.task_id],
        references: [tasks.id]
    }),
    user: one(users, {
        fields: [taskAssignees.user_id],
        references: [users.id]
    })
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
    board: one(boards, {
        fields: [boardMembers.board_id],
        references: [boards.id]
    }),
    user: one(users, {
        fields: [boardMembers.user_id],
        references: [users.id]
    })
}));
