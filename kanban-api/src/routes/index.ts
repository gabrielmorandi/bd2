// hono
import { Hono } from 'hono';
// routes
import { auth } from './auth';
import { users } from './users';
import { boards } from './boards';
import { columns } from './column';
import { tasks } from './tasks';
import { subtasks } from './subtasks';
import { tasksAssignees } from './tasksAssignnes';
import { boardsMembers } from './boardsMember';

const router = new Hono();

router.route('/auth', auth);
router.route('/users', users);
router.route('/boards', boards);
router.route('/columns', columns);
router.route('/tasks', tasks);
router.route('/subtasks', subtasks);
router.route('/tasks/assignees', tasksAssignees);
router.route('/boards/members', boardsMembers);

export default router;
