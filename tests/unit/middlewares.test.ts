import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/middlewares/auth';
import { validateUUID } from '../../src/middlewares/validateUUID';
import { generalLimiter } from '../../src/middlewares/rateLimiter';
import errorHandler from '../../src/middlewares/error.handler';
import jwt from 'jsonwebtoken';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  InternalServerError,
  AppError,
} from '../../src/utils/errors';

vi.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should authenticate valid token', () => {
    const token = 'valid-token';
    const payload = { userId: 'user-123' };

    req.headers = { authorization: `Bearer ${token}` };
    (jwt.verify as any).mockReturnValue(payload);

    authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when no token provided', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should throw UnauthorizedError when token is invalid', () => {
    const token = 'invalid-token';
    req.headers = { authorization: `Bearer ${token}` };

    (jwt.verify as any).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should throw UnauthorizedError when authorization header is malformed', () => {
    req.headers = { authorization: 'InvalidFormat' };

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe('UUID Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should validate correct UUID', () => {
    req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    const middleware = validateUUID('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should throw BadRequestError for invalid UUID', () => {
    req.params = { id: 'invalid-uuid' };

    const middleware = validateUUID('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('should throw BadRequestError when id is missing', () => {
    req.params = {};

    const middleware = validateUUID('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('should accept uppercase UUIDs', () => {
    req.params = { id: '123E4567-E89B-12D3-A456-426614174000' };

    const middleware = validateUUID('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
  });
});

describe('Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      requestId: 'test-request-id',
      path: '/test',
      method: 'GET',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should handle UnauthorizedError', () => {
    const error = new UnauthorizedError('Unauthorized access');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unauthorized access',
      })
    );
  });

  it('should handle BadRequestError', () => {
    const error = new BadRequestError('Bad request');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Bad request',
      })
    );
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('Resource not found');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Resource not found',
      })
    );
  });

  it('should handle InternalServerError', () => {
    const error = new InternalServerError('Server error');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error',
      })
    );
  });

  it('should handle unknown errors as 500', () => {
    const error = new Error('Unknown error');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unknown error',
      })
    );
  });

  it('should handle AppError with custom status code', () => {
    const error = new AppError('Custom error', 418);

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
      })
    );
  });
});
