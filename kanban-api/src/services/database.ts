import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
// drizzle
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and } from 'drizzle-orm';
// schema
import * as schema from '../models/schema';
// valueObjects
import {
    BoardInbound,
    BoardOutbound,
    BoardValueObject,
    UserInbound,
    UserOutbound,
    UserOutboundWithPasswordHash,
    UserValueObject
} from '../valueObjects';
import { ColumnInbound, ColumnOutbound, ColumnValueObject } from '../valueObjects/column';
import { TaskInbound, TaskOutbound, TaskValueObject } from '../valueObjects/task';
import { SubtaskInbound, SubtaskOutbound, SubtaskValueObject } from '../valueObjects/subtask';
import { TaskAssigneeInbound, TaskAssigneeOutbound, TaskAssigneeValueObject } from '../valueObjects/taskAssignee';
import { BoardMemberInbound, BoardMemberOutbound, BoardMemberValueObject } from '../valueObjects/boardMember';

export class DbService {
    private db: BetterSQLite3Database<typeof schema>;

    constructor() {
        this.db = drizzle(new Database('./database/db.sqlite'), { schema });
    }

    // user
    async createUser(user: UserInbound): Promise<UserOutbound | null> {
        const newUser = {
            ...user,
            password_hash: bcrypt.hashSync(user.password_hash, 10)
        } as UserInbound;
        const [createdUser] = await this.db.insert(schema.users).values(newUser).returning();
        if (!createdUser) return null;

        return UserValueObject.createOutbound(createdUser);
    }

    async getUserByEmail(email: string): Promise<UserOutbound | null> {
        const queryUser = await this.db.query.users.findFirst({ where: (users, { eq }) => eq(users.email, email) });
        if (!queryUser) return null;

        return UserValueObject.createOutbound(queryUser);
    }

    async getUserByEmailWithPasswordHash(email: string): Promise<UserOutboundWithPasswordHash | null> {
        const queryUser = await this.db.query.users.findFirst({ where: (users, { eq }) => eq(users.email, email) });
        if (!queryUser) return null;

        return UserValueObject.createOutboundWithPasswordHash(queryUser);
    }

    // board
    async createBoard(board: BoardInbound): Promise<BoardOutbound | null> {
        const [createdBoard] = await this.db.insert(schema.boards).values(board).returning();
        if (!createdBoard) return null;

        return BoardValueObject.createOutbound(createdBoard);
    }

    async getBoardById(id: string): Promise<BoardOutbound | null> {
        const queryBoard = await this.db.query.boards.findFirst({
            where: (boards, { eq }) => eq(boards.id, id)
        });
        if (!queryBoard) return null;

        return BoardValueObject.createOutbound(queryBoard);
    }

    async getAllBoardsByOwner(ownerId: string): Promise<BoardOutbound[]> {
        const boards = await this.db.query.boards.findMany({
            where: (boards, { eq }) => eq(boards.owner_id, ownerId)
        });

        return BoardValueObject.createOutboundArray(boards);
    }

    async updateBoardByBoardId(id: string, data: BoardInbound): Promise<BoardOutbound | null> {
        const [updatedBoard] = await this.db
            .update(schema.boards)
            .set(data)
            .where(eq(schema.boards.id, id))
            .returning();
        if (!updatedBoard) return null;

        return BoardValueObject.createOutbound(updatedBoard);
    }

    async deleteBoardByBoardId(id: string): Promise<BoardOutbound | null> {
        const [result] = await this.db.delete(schema.boards).where(eq(schema.boards.id, id)).returning();
        if (!result) return null;

        return BoardValueObject.createOutbound(result);
    }

    // column
    async createColumn(column: ColumnInbound): Promise<ColumnOutbound | null> {
        const [createdColumn] = await this.db.insert(schema.columns).values(column).returning();
        if (!createdColumn) return null;

        return ColumnValueObject.createOutbound(createdColumn);
    }

    async getColumnById(id: string): Promise<ColumnOutbound | null> {
        const queryColumn = await this.db.query.columns.findFirst({
            where: (columns, { eq }) => eq(columns.id, id)
        });

        if (!queryColumn) return null;

        return ColumnValueObject.createOutbound(queryColumn);
    }

    async getColumnsByBoard(boardId: string): Promise<ColumnOutbound[]> {
        const columns = await this.db.query.columns.findMany({
            where: (columns, { eq }) => eq(columns.board_id, boardId)
        });

        return ColumnValueObject.createOutboundArray(columns);
    }

    async updateColumnByColumnId(id: string, data: ColumnInbound): Promise<ColumnOutbound | null> {
        const [updatedColumn] = await this.db
            .update(schema.columns)
            .set(data)
            .where(eq(schema.columns.id, id))
            .returning();
        if (!updatedColumn) return null;

        return ColumnValueObject.createOutbound(updatedColumn);
    }

    async deleteColumnByColumnId(id: string): Promise<ColumnOutbound | null> {
        const [result] = await this.db.delete(schema.columns).where(eq(schema.columns.id, id)).returning();
        if (!result) return null;

        return ColumnValueObject.createOutbound(result);
    }

    // task
    async createTask(task: TaskInbound): Promise<TaskOutbound | null> {
        const [createdTask] = await this.db.insert(schema.tasks).values(task).returning();
        if (!createdTask) return null;

        return TaskValueObject.createOutbound(createdTask);
    }

    async getTaskById(id: string): Promise<TaskOutbound | null> {
        const queryTask = await this.db.query.tasks.findFirst({
            where: (tasks, { eq }) => eq(tasks.id, id)
        });

        if (!queryTask) return null;

        return TaskValueObject.createOutbound(queryTask);
    }

    async getTasksByColumnId(columnId: string): Promise<TaskOutbound[]> {
        const tasks = await this.db.query.tasks.findMany({
            where: (tasks, { eq }) => eq(tasks.column_id, columnId)
        });

        return TaskValueObject.createOutboundArray(tasks);
    }

    async updateTaskById(id: string, data: TaskInbound): Promise<TaskOutbound | null> {
        const [updatedTask] = await this.db.update(schema.tasks).set(data).where(eq(schema.tasks.id, id)).returning();
        if (!updatedTask) return null;

        return TaskValueObject.createOutbound(updatedTask);
    }

    async deleteTaskById(id: string): Promise<TaskOutbound | null> {
        const [result] = await this.db.delete(schema.tasks).where(eq(schema.tasks.id, id)).returning();
        if (!result) return null;

        return TaskValueObject.createOutbound(result);
    }

    // subtask
    async createSubtask(subtask: SubtaskInbound): Promise<SubtaskOutbound | null> {
        const [createdSubtask] = await this.db.insert(schema.subtasks).values(subtask).returning();
        if (!createdSubtask) return null;

        return SubtaskValueObject.createOutbound(createdSubtask);
    }

    async getSubtaskById(id: string): Promise<SubtaskOutbound | null> {
        const querySubtask = await this.db.query.subtasks.findFirst({
            where: (subtasks, { eq }) => eq(subtasks.id, id)
        });

        if (!querySubtask) return null;

        return SubtaskValueObject.createOutbound(querySubtask);
    }

    async getSubtasksByTask(taskId: string): Promise<SubtaskOutbound[]> {
        const subtasks = await this.db.query.subtasks.findMany({
            where: (subtasks, { eq }) => eq(subtasks.task_id, taskId)
        });

        return SubtaskValueObject.createOutboundArray(subtasks);
    }

    async updateSubtaskById(id: string, data: SubtaskInbound): Promise<SubtaskOutbound | null> {
        const [updatedSubtask] = await this.db
            .update(schema.subtasks)
            .set(data)
            .where(eq(schema.subtasks.id, id))
            .returning();
        if (!updatedSubtask) return null;

        return SubtaskValueObject.createOutbound(updatedSubtask);
    }

    async deleteSubtaskById(id: string): Promise<SubtaskOutbound | null> {
        const [result] = await this.db.delete(schema.subtasks).where(eq(schema.subtasks.id, id)).returning();
        if (!result) return null;

        return SubtaskValueObject.createOutbound(result);
    }

    // taskAssignees
    async addTaskAssignee(taskAssignee: TaskAssigneeInbound): Promise<TaskAssigneeOutbound | null> {
        const [created] = await this.db.insert(schema.taskAssignees).values(taskAssignee).returning();
        if (!created) return null;

        return TaskAssigneeValueObject.createOutbound(created);
    }

    async getTaskAssigneeByUserId(taskId: string, userId: string): Promise<TaskAssigneeOutbound | null> {
        const assignee = await this.db.query.taskAssignees.findFirst({
            where: (ta, { eq, and }) => and(eq(ta.task_id, taskId), eq(ta.user_id, userId))
        });
        if (!assignee) return null;

        return TaskAssigneeValueObject.createOutbound(assignee);
    }

    async getAssigneesByTaskId(taskId: string): Promise<TaskAssigneeOutbound[]> {
        const assignees = await this.db.query.taskAssignees.findMany({
            where: (ta, { eq }) => eq(ta.task_id, taskId)
        });

        return TaskAssigneeValueObject.createOutboundArray(assignees);
    }

    async removeTaskAssigneeByTaskId(taskId: string, userId: string): Promise<TaskAssigneeOutbound | null> {
        const [result] = await this.db
            .delete(schema.taskAssignees)
            .where(and(eq(schema.taskAssignees.task_id, taskId), eq(schema.taskAssignees.user_id, userId)))
            .returning();
        if (!result) return null;

        return TaskAssigneeValueObject.createOutbound(result);
    }

    // boardMembers
    async addBoardMember(board: BoardMemberInbound): Promise<BoardMemberOutbound | null> {
        const [created] = await this.db.insert(schema.boardMembers).values(board).returning();
        if (!created) return null;

        return BoardMemberValueObject.createOutbound(created);
    }

    async getBoardMemberByBoardId(boardId: string, userId: string): Promise<BoardMemberOutbound | null> {
        const result = await this.db.query.boardMembers.findFirst({
            where: and(eq(schema.boardMembers.board_id, boardId), eq(schema.boardMembers.user_id, userId))
        });
        if (!result) return null;

        return BoardMemberValueObject.createOutbound(result);
    }

    async getMembersByBoardId(boardId: string): Promise<BoardMemberOutbound[]> {
        const rows = await this.db.query.boardMembers.findMany({
            where: eq(schema.boardMembers.board_id, boardId)
        });

        return BoardMemberValueObject.createOutboundArray(rows);
    }

    async removeBoardMemberByBoardId(boardId: string, userId: string): Promise<BoardMemberOutbound | null> {
        const [result] = await this.db
            .delete(schema.boardMembers)
            .where(and(eq(schema.boardMembers.board_id, boardId), eq(schema.boardMembers.user_id, userId)))
            .returning();
        if (!result) return null;

        return BoardMemberValueObject.createOutbound(result);
    }
}
