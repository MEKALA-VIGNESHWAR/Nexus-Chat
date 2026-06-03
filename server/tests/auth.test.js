/**
 * Auth Integration/Unit Tests
 * Uses Supertest to query mock auth endpoints and verify JWT token flows.
 */

jest.mock('express-rate-limit', () => {
  return () => (req, res, next) => next();
});

jest.mock('../src/config/db', () => {
  return {
    connectDB: jest.fn().mockResolvedValue(),
    disconnectDB: jest.fn().mockResolvedValue(),
    query: jest.fn(),
  };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const app = require('../src/app');
const db = require('../src/config/db');
const env = require('../src/config/env');
const logger = require('../src/utils/logger');

// Mute logs during test execution
logger.transports.forEach((t) => {
  t.silent = true;
});

describe('Authentication API', () => {
  let mockUsersDb = [];

  beforeEach(() => {
    mockUsersDb = [];
    jest.clearAllMocks();

    // Mock database query behavior
    db.query.mockImplementation(async (sql, params) => {
      const normalizedSql = sql.trim().replace(/\s+/g, ' ').toUpperCase();

      if (normalizedSql.startsWith('INSERT INTO USERS')) {
        const newUser = {
          id: 'mock-user-uuid',
          username: params[0],
          email: params[1],
          password: params[2],
          avatar_url: params[3],
          avatar_public_id: params[4],
          status_online: params[5],
          status_last_seen: params[6],
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        };
        mockUsersDb.push(newUser);
        return { rows: [newUser] };
      }

      if (normalizedSql.startsWith('SELECT * FROM USERS WHERE EMAIL = $1')) {
        const email = params[0].toLowerCase();
        const user = mockUsersDb.find((u) => u.email === email);
        return { rows: user ? [user] : [] };
      }

      if (normalizedSql.startsWith('SELECT * FROM USERS WHERE ID = $1')) {
        const id = params[0];
        const user = mockUsersDb.find((u) => u.id === id);
        return { rows: user ? [user] : [] };
      }

      if (normalizedSql.startsWith('SELECT * FROM USERS WHERE')) {
        if (params.length === 2) {
          const user = mockUsersDb.find(
            (u) => u.email === params[0] || u.username === params[1]
          );
          return { rows: user ? [user] : [] };
        }
        const user = mockUsersDb.find(
          (u) => u.email === params[0] || u.username === params[0]
        );
        return { rows: user ? [user] : [] };
      }

      if (normalizedSql.startsWith('UPDATE USERS')) {
        if (params.length === 9) {
          const id = params[8];
          const userIndex = mockUsersDb.findIndex((u) => u.id === id);
          if (userIndex !== -1) {
            mockUsersDb[userIndex] = {
              ...mockUsersDb[userIndex],
              username: params[0],
              email: params[1],
              password: params[2],
              avatar_url: params[3],
              avatar_public_id: params[4],
              status_online: params[5],
              status_last_seen: params[6],
              refresh_token: params[7],
              updated_at: new Date(),
            };
            return { rows: [mockUsersDb[userIndex]] };
          }
        } else {
          // findByIdAndUpdate: UPDATE users SET ... WHERE id = $1 RETURNING *
          const id = params[0];
          const userIndex = mockUsersDb.findIndex((u) => u.id === id);
          if (userIndex !== -1) {
            const setPart = sql.substring(sql.indexOf('SET') + 3, sql.indexOf('WHERE'));
            const assignments = setPart.split(',').map((s) => s.trim());
            assignments.forEach((assignment) => {
              const parts = assignment.split('=').map((s) => s.trim());
              const col = parts[0];
              const placeholder = parts[1];
              const paramIdx = parseInt(placeholder.substring(1), 10) - 1;
              const val = params[paramIdx];

              if (col === 'refresh_token') mockUsersDb[userIndex].refresh_token = val;
              if (col === 'status_online') mockUsersDb[userIndex].status_online = val;
              if (col === 'status_last_seen') mockUsersDb[userIndex].status_last_seen = val;
              if (col === 'username') mockUsersDb[userIndex].username = val;
              if (col === 'email') mockUsersDb[userIndex].email = val;
              if (col === 'avatar_url') mockUsersDb[userIndex].avatar_url = val;
              if (col === 'avatar_public_id') mockUsersDb[userIndex].avatar_public_id = val;
            });
            return { rows: [mockUsersDb[userIndex]] };
          }
        }
        return { rows: [] };
      }

      return { rows: [] };
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.username).toBe('johndoe');
      expect(res.body.data.user.email).toBe('johndoe@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail registration when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'Password123',
          confirmPassword: 'DifferentPassword',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should fail registration when username already exists', async () => {
      mockUsersDb.push({
        id: 'existing-uuid',
        username: 'johndoe',
        email: 'other@example.com',
        password: 'hashedpassword',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username is already taken');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let hashedPassword;

    beforeAll(async () => {
      hashedPassword = await bcrypt.hash('Password123', 10);
    });

    it('should login successfully with correct credentials', async () => {
      mockUsersDb.push({
        id: 'user-uuid',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: hashedPassword,
        avatar_url: '',
        avatar_public_id: '',
        status_online: false,
        status_last_seen: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'johndoe@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('johndoe');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      mockUsersDb.push({
        id: 'user-uuid',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'johndoe@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const userId = 'user-uuid';
      const refreshToken = jwt.sign({ userId }, env.jwt.refreshSecret, {
        expiresIn: '7d',
      });
      const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

      mockUsersDb.push({
        id: userId,
        username: 'johndoe',
        email: 'johndoe@example.com',
        refresh_token: hashedRefreshToken,
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail refresh when token reuse is detected', async () => {
      const userId = 'user-uuid';
      const refreshToken = jwt.sign({ userId }, env.jwt.refreshSecret, {
        expiresIn: '7d',
      });
      const differentHashedToken = crypto.createHash('sha256').update('different_token').digest('hex');

      mockUsersDb.push({
        id: userId,
        username: 'johndoe',
        email: 'johndoe@example.com',
        refresh_token: differentHashedToken,
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Token reuse detected');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully when authenticated', async () => {
      const userId = 'user-uuid';
      const accessToken = jwt.sign({ userId }, env.jwt.accessSecret, {
        expiresIn: '15m',
      });

      mockUsersDb.push({
        id: userId,
        username: 'johndoe',
        email: 'johndoe@example.com',
        status_online: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
      const user = mockUsersDb.find((u) => u.id === userId);
      expect(user.status_online).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile when authenticated', async () => {
      const userId = 'user-uuid';
      const accessToken = jwt.sign({ userId }, env.jwt.accessSecret, {
        expiresIn: '15m',
      });

      mockUsersDb.push({
        id: userId,
        username: 'johndoe',
        email: 'johndoe@example.com',
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('johndoe');
    });

    it('should fail when access token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
