import { beforeAll, afterAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';
  process.env.RATE_LIMIT_WINDOW_MS = '999999999';
  process.env.RATE_LIMIT_MAX = '999999';
});

afterAll(() => {
});

afterEach(() => {
  vi.clearAllMocks();
});
