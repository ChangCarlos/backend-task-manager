import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../../src/services/user.service';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../src/utils/errors';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const result = await userService.create(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(result).toEqual({
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictError if email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing-user' });

      await expect(userService.create(userData)).rejects.toThrow(ConflictError);
      await expect(userService.create(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        token: '',
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      const mockToken = 'jwt-token-123';

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue(mockToken);

      const result = await userService.login(loginData);

      expect(result).toEqual({ token: mockToken });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should throw UnauthorizedError if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
        token: '',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(userService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(userService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password',
        token: '',
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(userService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(userService.login(loginData)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const userId = 'user-id-123';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 'nonexistent-user';

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'user-id-123';
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        id: userId,
        name: 'Updated Name',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.update as any).mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictError if new email already exists', async () => {
      const userId = 'user-id-123';
      const updateData = { email: 'existing@example.com' };

      (prisma.user.findUnique as any).mockResolvedValue({ id: 'other-user-id' });

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(ConflictError);
      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'Email already in use'
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-id-123';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword';

      const mockUser = {
        id: userId,
        password: 'hashed-old-password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('hashed-new-password');
      (prisma.user.update as any).mockResolvedValue({});

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should throw UnauthorizedError if current password is incorrect', async () => {
      const userId = 'user-id-123';
      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword';

      const mockUser = {
        id: userId,
        password: 'hashed-old-password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        userService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        userService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 'nonexistent-user';
      const currentPassword = 'password';
      const newPassword = 'newPassword';

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        userService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
