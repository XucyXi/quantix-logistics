import {describe, it, expect, vi} from 'vitest';
import {requireRole} from '../../middlewares/roleMiddleware.js';

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

describe('roleMiddleware integration', () => {
  it('returns 403 when role does not match', () => {
    const req = {user: {role: 'customer'}};
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('calls next when role matches', () => {
    const req = {user: {role: 'admin'}};
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });
});

