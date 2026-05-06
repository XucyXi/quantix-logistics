import {describe, it, expect, vi} from 'vitest';
import jwt from 'jsonwebtoken';
import {authenticate} from '../../middlewares/authMiddleware.js';

describe('authMiddleware integration', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = {headers: {}};
    const res = {
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
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authorization header');
  });

  it('attaches decoded user and calls next for valid token', () => {
    const token = jwt.sign(
      {user_id: 99, role: 'admin'},
      process.env.JWT_SECRET || 'test-secret'
    );
    const req = {headers: {authorization: `Bearer ${token}`}};
    const res = {
      status() {
        return this;
      },
      json() {
        return this;
      },
    };
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({user_id: 99, role: 'admin'});
  });
});

