import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth Endpoints', () => {
  let testUserId: string;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!@#',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 when email already exists', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: 'invalid-email',
          password: '',
        })
        .expect(400);
    });
  });
});

describe('User Profile Endpoints', () => {
  let authToken: string;
  let testUserId: string;
  const testUser = {
    name: 'Profile User',
    email: 'profile@example.com',
    password: 'Profile123!@#',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/users/me').expect(401);

      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .put('/api/users/me')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '', email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('should change password with correct old password', async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: 'NewPassword123!@#',
      };

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password changed successfully');

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: passwordData.newPassword,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');

      testUser.password = passwordData.newPassword;
    });

    it('should return 401 for incorrect current password', async () => {
      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!@#',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Current password is incorrect');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .put('/api/users/me/password')
        .send({
          currentPassword: 'old',
          newPassword: 'new',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: '123',
          newPassword: 'abc',
        })
        .expect(400);
    });
  });
});
