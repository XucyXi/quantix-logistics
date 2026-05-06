import request from 'supertest';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../services/authService.js', () => {
  return {
    default: {
      register: vi.fn(),
      login: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      updateDriverProfile: vi.fn(),
      changePassword: vi.fn(),
    },
  };
});

import authService from '../../services/authService.js';

let app;

describe('Auth routes e2e', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    const mod = await import('../../app.js');
    app = mod.createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/auth/test returns server works payload', async () => {
    const res = await request(app).get('/api/auth/test');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Server works');
    expect(res.body.method).toBe('GET');
  });

  it('POST /api/auth/register returns 201 on successful registration', async () => {
    authService.register.mockResolvedValue({
      success: true,
      user: {user_id: 10, email: 'new@example.com'},
      token: 'signed-token',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      password: 'secure12345',
      role: 'customer',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(authService.register).toHaveBeenCalledOnce();
  });

  it('POST /api/auth/login returns 400 on invalid credentials', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrong@example.com',
      password: 'bad-pass',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('GET /api/auth/profile returns 401 without bearer token', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Authorization');
  });

  it('GET /api/auth/profile returns profile with valid token', async () => {
    authService.getProfile.mockResolvedValue({
      user_id: 7,
      full_name: 'Demo User',
      role: 'customer',
    });

    const token = jwt.sign(
      {user_id: 7, role: 'customer'},
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.full_name).toBe('Demo User');
  });
});

