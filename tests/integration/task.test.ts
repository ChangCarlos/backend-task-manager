import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Task Endpoints', () => {
  let authToken: string;
  let testUserId: string;
  let otherUserId: string;
  let otherAuthToken: string;
  let taskId: string;

  const testUser = {
    name: 'Task User',
    email: 'taskuser@example.com',
    password: 'TaskUser123!@#',
  };

  const otherUser = {
    name: 'Other User',
    email: 'otheruser@example.com',
    password: 'OtherUser123!@#',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, otherUser.email],
        },
      },
    });

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
      },
    });

    testUserId = user.id;
    authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    const otherHashedPassword = await bcrypt.hash(otherUser.password, 10);
    const other = await prisma.user.create({
      data: {
        name: otherUser.name,
        email: otherUser.email,
        password: otherHashedPassword,
      },
    });

    otherUserId = other.id;
    otherAuthToken = jwt.sign({ userId: other.id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    await prisma.task.deleteMany({
      where: {
        userId: {
          in: [testUserId, otherUserId],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, otherUser.email],
        },
      },
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', taskData.title);
      expect(response.body).toHaveProperty('description', taskData.description);
      expect(response.body).toHaveProperty('completed', false);
      expect(response.body).toHaveProperty('userId', testUserId);

      taskId = response.body.id;
    });

    it('should return 401 without token', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeAll(async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 2', description: 'Description 2', userId: testUserId, completed: false },
          { title: 'Task 3', description: 'Description 3', userId: testUserId, completed: true },
          { title: 'Important Task', description: 'Important', userId: testUserId, completed: false },
        ],
      });
    });

    it('should return cursor-paginated tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('nextCursor');
      expect(response.body).toHaveProperty('hasMore');
      expect(response.body).toHaveProperty('limit', 20);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by search term', async () => {
      const response = await request(app)
        .get('/api/tasks?search=important')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some(
          (task: any) =>
            task.title.toLowerCase().includes('important') ||
            task.description.toLowerCase().includes('important')
        )
      ).toBe(true);
    });

    it('should filter tasks by completed status', async () => {
      const response = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((task: any) => task.completed === true)).toBe(true);
    });

    it('should support cursor-based pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('limit', 2);
      expect(response.body).toHaveProperty('hasMore');
      expect(response.body).toHaveProperty('nextCursor');
      
      // If there are more results, test next page with cursor
      if (response.body.hasMore && response.body.nextCursor) {
        const nextResponse = await request(app)
          .get(`/api/tasks?limit=2&cursor=${response.body.nextCursor}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        
        expect(nextResponse.body.data.length).toBeGreaterThan(0);
        // Ensure no duplicate results
        const firstPageIds = response.body.data.map((t: any) => t.id);
        const secondPageIds = nextResponse.body.data.map((t: any) => t.id);
        expect(firstPageIds.some((id: string) => secondPageIds.includes(id))).toBe(false);
      }
    });

    it('should return 401 without token', async () => {
      await request(app).get('/api/tasks').expect(401);
    });

    it('should only return tasks belonging to authenticated user', async () => {
      await prisma.task.create({
        data: {
          title: 'Other User Task',
          description: 'Should not be visible',
          userId: otherUserId,
        },
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((task: any) => task.userId === testUserId)).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by id if user owns it', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', taskId);
      expect(response.body).toHaveProperty('userId', testUserId);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Task not found');
    });

    it('should return 403 if user does not own task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', "You don't have permission to access this task");
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/api/tasks/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app).get(`/api/tasks/${taskId}`).expect(401);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task if user owns it', async () => {
      const updateData = {
        title: 'Updated Task',
        completed: true,
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('completed', updateData.completed);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update' })
        .expect(404);
    });

    it('should return 403 if user does not own task', async () => {
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .put('/api/tasks/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update' })
        .expect(400);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Update' })
        .expect(401);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let deleteTaskId: string;

    beforeAll(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          description: 'Will be deleted',
          userId: testUserId,
        },
      });
      deleteTaskId = task.id;
    });

    it('should delete task if user owns it', async () => {
      await request(app)
        .delete(`/api/tasks/${deleteTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const task = await prisma.task.findUnique({
        where: { id: deleteTaskId },
      });
      expect(task).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 if user does not own task', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Protected Task',
          userId: testUserId,
        },
      });

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(403);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .delete('/api/tasks/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app).delete(`/api/tasks/${taskId}`).expect(401);
    });
  });
});
