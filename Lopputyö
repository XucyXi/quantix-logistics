# Quantix Logistics - Completion README

This README is an implementation playbook for finishing the project on branch `dev`.
It is written so developers can pick tasks and code immediately.

## Goal

Ship a release-ready full-stack app by closing integration gaps between:
- `frontend` (React + Vite + TypeScript)
- `backend` (Express + MySQL)

## Current Reality (short)

Top blockers identified in `dev`:
- Frontend and backend API prefixes are inconsistent (`/api/v1` vs `/api`).
- Frontend expects endpoints that backend does not expose yet.
- `backend/routes/adminRoutes.js` exists but is not mounted in `backend/server.js`.
- Missing route file import target in frontend (`StoresPage`).
- Mock/stub behavior still exists in auth/checkout/notification flows.
- No strict release gate scripts (lint/typecheck/test) and no CI workflow.

---

## Priority Plan

### Must-have before release

1. Unify API base path and endpoint contracts.
2. Mount and implement all backend routes used by frontend.
3. Replace mock auth flow with real API-driven authentication.
4. Fix missing `StoresPage` route/file mismatch.
5. Add lint, typecheck, and test scripts; then run them in CI.
6. Remove stubs from critical business flows (checkout, notifications, settings).

### Should-have

1. Add backend request validation and consistent API error format.
2. Remove sensitive debug logging.
3. Add `.env.example` and setup docs.
4. Strengthen security defaults (no fallback JWT secret).

---

## Implementation Tasks With Copy-Paste Starter Code

Use these templates as baseline patches. Adapt names/types to your current codebase as needed.

### 1) Backend: mount `admin` routes in `backend/server.js`

If `adminRoutes.js` exists but is not mounted, add:

```js
// backend/server.js
const adminRoutes = require('./routes/adminRoutes');

// ... existing app.use calls
app.use('/api/admin', adminRoutes);
```

Also ensure auth/role middleware is used inside `adminRoutes.js`:

```js
// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get(
  '/analytics/revenue',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getRevenueStats
);

router.get(
  '/analytics/orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getOrderStats
);

module.exports = router;
```

---

### 2) Backend: add missing analytics controller

```js
// backend/controllers/analyticsController.js
const pool = require('../config/db');

async function getRevenueStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        COALESCE(SUM(total_price), 0) AS total_revenue,
        COUNT(*) AS total_orders,
        COALESCE(AVG(total_price), 0) AS avg_order_value,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
      FROM ORDERS
      WHERE ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return res.json({ success: true, stats: rows[0] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue stats',
      error: error.message,
    });
  }
}

async function getOrderStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM ORDERS
      GROUP BY status
    `);

    return res.json({ success: true, stats: rows });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
      error: error.message,
    });
  }
}

module.exports = {
  getRevenueStats,
  getOrderStats,
};
```

---

### 3) Backend: add customer orders endpoint with pagination

```js
// backend/services/orderService.js
async function getOrdersByCustomerId(customerId, { limit = 20, offset = 0, status } = {}) {
  let query = `
    SELECT o.order_id, o.status, o.delivery_address, o.total_price, o.ordered_at
    FROM ORDERS o
    WHERE o.customer_id = ?
  `;
  const params = [customerId];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  return rows;
}
```

```js
// backend/controllers/orderController.js
async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.user_id;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const status = req.query.status || undefined;

    const orders = await orderService.getOrdersByCustomerId(customerId, {
      limit,
      offset,
      status,
    });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message,
    });
  }
}
```

```js
// backend/routes/orderRoutes.js
router.get(
  '/my-orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('customer'),
  orderController.getCustomerOrders
);
```

---

### 4) Frontend: unify API client base URL (`frontend/src/app/lib/api.ts`)

Pick one standard (recommended: `/api`) and use it everywhere.

```ts
// frontend/src/app/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('quantix_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Add matching env in frontend:

```env
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000/api
```

---

### 5) Frontend: remove mock auth and call real backend

```ts
// frontend/src/app/contexts/AuthContext.tsx (example service usage)
import api from '../lib/api';

async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.token);
  setUser(data.user);
}

async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  await api.post('/auth/register', payload);
}
```

Remove hardcoded mock users/tokens after real auth is working.

---

### 6) Frontend: fix missing `StoresPage`

If route exists in `frontend/src/app/routes.tsx`, create the file:

```tsx
// frontend/src/app/pages/StoresPage.tsx
export default function StoresPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold">Stores</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO: Implement real store listing and details.
      </p>
    </section>
  );
}
```

If you do not need this route, remove the import and route entry instead.

---

### 7) Backend: replace notification stub

```js
// backend/services/notificationService.js
async function sendOrderNotification({ userId, message, channel = 'email' }) {
  // TODO: integrate real provider (SendGrid/Twilio/etc.)
  // Keep interface stable so controller code does not change later.
  console.info('[notification]', { userId, channel, message });
  return { success: true };
}

module.exports = { sendOrderNotification };
```

Use this in order status update flow:

```js
await notificationService.sendOrderNotification({
  userId: customerId,
  message: `Order ${orderId} status changed to ${newStatus}`,
});
```

---

## Release Gate Scripts (add now)

### `frontend/package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

### `backend/package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "db:init": "node config/init.js",
    "lint": "eslint .",
    "test": "jest --runInBand"
  }
}
```

If test/lint deps are not installed yet, add them first:

```bash
# frontend
npm i -D vitest @testing-library/react @testing-library/jest-dom eslint

# backend
npm i -D jest supertest eslint
```

---

## CI Starter (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --passWithNoTests
```

---

## Definition of Done (DoD)

Project is ready when all are true:
- [ ] Frontend login/register/order pages work against real backend data.
- [ ] No mock auth/order data in critical user flows.
- [ ] All required backend endpoints exist and return consistent JSON format.
- [ ] `npm run build` succeeds for frontend.
- [ ] Backend starts without fallback secrets and without startup errors.
- [ ] Lint/typecheck/test commands pass in local and CI.
- [ ] `.env.example` exists for frontend and backend.
- [ ] No critical 4xx/5xx errors in browser network logs during core flows.

---

## Suggested Execution Order (1 sprint)

1. API contract unification (`/api` strategy).
2. Backend endpoint completion and route mounting.
3. Frontend auth and order flows switched from mock to real API.
4. Fix compile blockers (`StoresPage` route mismatch).
5. Add test/lint/typecheck scripts and CI.
6. Final end-to-end smoke test and bugfix pass.

---

## Quick Start Commands

```bash
# backend
cd backend
npm install
npm run db:init
npm start
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

Then verify:
- API health/login works from frontend
- customer order list loads
- admin analytics loads
- no console/network critical errors
