import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('../../services/authService.js', () => {
  return {
    default: {
      register: vi.fn(),
      login: vi.fn(),
      getProfile: vi.fn(),
    },
  };
});

import authService from '../../services/authService.js';
import * as authController from '../../controllers/authController.js';

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('authController integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register returns 201 with service payload', async () => {
    const req = {
      body: {email: 'new@example.com', password: 'secret123', role: 'customer'},
    };
    const res = mockRes();
    const payload = {success: true, user: {id: 1}, token: 'jwt'};
    authService.register.mockResolvedValue(payload);

    await authController.register(req, res);

    expect(authService.register).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(payload);
  });

  it('register returns 400 when service throws', async () => {
    const req = {
      body: {email: 'dup@example.com', password: 'secret123', role: 'customer'},
    };
    const res = mockRes();
    authService.register.mockRejectedValue(new Error('Email already in use'));

    await authController.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({error: 'Email already in use'});
  });

  it('login returns 200 with token payload', async () => {
    const req = {body: {email: 'user@example.com', password: 'secret123'}};
    const res = mockRes();
    authService.login.mockResolvedValue({
      success: true,
      token: 'jwt-token',
      user: {user_id: 3, role: 'customer'},
    });

    await authController.login(req, res);

    expect(authService.login).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('jwt-token');
  });
});

