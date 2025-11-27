// drizzle
import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';

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
);
