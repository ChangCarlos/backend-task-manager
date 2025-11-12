import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as taskService from '../../src/services/task.service';
import prisma from '../../src/lib/prisma';
import { NotFoundError, ForbiddenError } from '../../src/utils/errors';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Task Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };
      const userId = 'user-id-123';

      const mockTask = {
        id: 'task-id-123',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.create as any).mockResolvedValue(mockTask);

      const result = await taskService.create(taskData, userId);

      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: taskData.title,
          description: taskData.description,
          userId,
        },
      });
    });

    it('should create task with empty description if not provided', async () => {
      const taskData = {
        title: 'Test Task',
      };
      const userId = 'user-id-123';

      const mockTask = {
        id: 'task-id-123',
        title: 'Test Task',
        description: '',
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.create as any).mockResolvedValue(mockTask);

      const result = await taskService.create(taskData, userId);

      expect(result.description).toBe('');
    });
  });

  describe('list', () => {
    it('should return paginated tasks for user', async () => {
      const userId = 'user-id-123';
      const params = {
        userId,
        page: 1,
        limit: 10,
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          completed: false,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          completed: true,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.task.findMany as any).mockResolvedValue(mockTasks);
      (prisma.task.count as any).mockResolvedValue(2);

      const result = await taskService.list(params);

      expect(result).toEqual({
        data: mockTasks,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter tasks by search term', async () => {
      const userId = 'user-id-123';
      const params = {
        userId,
        search: 'important',
      };

      (prisma.task.findMany as any).mockResolvedValue([]);
      (prisma.task.count as any).mockResolvedValue(0);

      await taskService.list(params);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            OR: [
              { title: { contains: 'important', mode: 'insensitive' } },
              { description: { contains: 'important', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter tasks by completed status', async () => {
      const userId = 'user-id-123';
      const params = {
        userId,
        completed: true,
      };

      (prisma.task.findMany as any).mockResolvedValue([]);
      (prisma.task.count as any).mockResolvedValue(0);

      await taskService.list(params);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            completed: true,
          }),
        })
      );
    });

    it('should order tasks correctly', async () => {
      const userId = 'user-id-123';
      const params = {
        userId,
        orderBy: 'title' as const,
        order: 'asc' as const,
      };

      (prisma.task.findMany as any).mockResolvedValue([]);
      (prisma.task.count as any).mockResolvedValue(0);

      await taskService.list(params);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            title: 'asc',
          },
        })
      );
    });
  });

  describe('getById', () => {
    it('should return task if user owns it', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);

      const result = await taskService.getById(taskId, userId);

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundError if task does not exist', async () => {
      const taskId = 'nonexistent-task';
      const userId = 'user-id-123';

      (prisma.task.findUnique as any).mockResolvedValue(null);

      await expect(taskService.getById(taskId, userId)).rejects.toThrow(NotFoundError);
      await expect(taskService.getById(taskId, userId)).rejects.toThrow('Task not found');
    });

    it('should throw ForbiddenError if user does not own task', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';
      const otherUserId = 'other-user-id';

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        userId: otherUserId,
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);

      await expect(taskService.getById(taskId, userId)).rejects.toThrow(ForbiddenError);
      await expect(taskService.getById(taskId, userId)).rejects.toThrow(
        "You don't have permission to access this task"
      );
    });
  });

  describe('update', () => {
    it('should update task if user owns it', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';
      const updateData = { completed: true };

      const mockTask = {
        id: taskId,
        userId,
      };

      const mockUpdatedTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        completed: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);
      (prisma.task.update as any).mockResolvedValue(mockUpdatedTask);

      const result = await taskService.update(taskId, updateData, userId);

      expect(result).toEqual(mockUpdatedTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
      });
    });

    it('should throw NotFoundError if task does not exist', async () => {
      const taskId = 'nonexistent-task';
      const userId = 'user-id-123';
      const updateData = { completed: true };

      (prisma.task.findUnique as any).mockResolvedValue(null);

      await expect(taskService.update(taskId, updateData, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not own task', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';
      const otherUserId = 'other-user-id';
      const updateData = { completed: true };

      const mockTask = {
        id: taskId,
        userId: otherUserId,
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);

      await expect(taskService.update(taskId, updateData, userId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteTask', () => {
    it('should delete task if user owns it', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';

      const mockTask = {
        id: taskId,
        userId,
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);
      (prisma.task.delete as any).mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(taskId, userId);

      expect(result).toBe(true);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('should throw NotFoundError if task does not exist', async () => {
      const taskId = 'nonexistent-task';
      const userId = 'user-id-123';

      (prisma.task.findUnique as any).mockResolvedValue(null);

      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not own task', async () => {
      const taskId = 'task-id-123';
      const userId = 'user-id-123';
      const otherUserId = 'other-user-id';

      const mockTask = {
        id: taskId,
        userId: otherUserId,
      };

      (prisma.task.findUnique as any).mockResolvedValue(mockTask);

      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(ForbiddenError);
    });
  });
});
