# Project Status and Roadmap

## 1. High-level current status

- Backend is partially implemented and running under Express.
- Frontend has a lot of UI and page scaffolding, but much of it still depends on mock data or disabled backend integration.
- The two sides are not connected cleanly yet.
- Validation is mostly missing or incomplete on both backend and frontend.

## 2. What is currently working / implemented

### Backend

- `backend/server.js` starts Express and mounts:
  - `/api/auth` via `authRoutes.js`
  - `/api/products` via `productRoutes.js`
  - `/api/orders` via `orderRoutes.js`
  - `/api/deliveries` via `deliveryRoutes.js`
- Auth service supports registration and login with JWT issuance.
- Order controller/service supports order creation, customer order listing, assigned driver listing, order status update, and order stats.
- Delivery controller supports updating location and fetching tracking status.
- Admin analytics controller exists in `backend/controllers/analyticsController.js`.

### Frontend

- React app and pages are built out for customer, admin, and driver flows.
- `frontend/src/app/contexts/AuthContext.tsx` provides auth state handling.
- `frontend/src/app/services/orderService.ts` and `frontend/src/app/services/adminService.ts` contain actual API fetch skeletons.
- `frontend/src/app/lib/api.ts` contains a custom Axios client with auth token and refresh handling.

## 3. Confirmed blocking issues

### Backend / frontend integration mismatch

- `frontend/src/app/lib/api.ts` uses base URL `/api/v1`, but `backend/server.js` serves on `/api`.
- Some frontend services use `/api` directly, while others use `/api/v1` through `api.ts`.
- This means the frontend cannot reliably call backend endpoints until the prefix is unified.

### Backend route registration is incomplete

- `backend/routes/adminRoutes.js` exists, but `backend/server.js` does not mount it.
- Result: `/api/admin/...` calls from the frontend will fail.

### Auth refresh mismatch

- Frontend expects `/api/v1/auth/refresh` and refresh-token behavior in `frontend/src/app/lib/api.ts`.
- Backend has no `/refresh` endpoint in `authRoutes.js`.
- Backend also does not currently issue or manage refresh tokens.

### Mock auth and non-backend login

- `frontend/src/app/contexts/AuthContext.tsx` uses a hard-coded `MOCK_USERS` array and does not call backend login/register.
- Login and registration pages are effectively operating in demo/mock mode.

### Missing CORS / dev cross-origin support

- Backend has no CORS middleware imported or configured.
- If frontend runs on Vite dev server and backend on port 3000, browser requests will fail without CORS.

### Environment configuration gaps

- Backend DB config uses `.env` values from `backend/config/db.js`.
- There is no `.env` file visible in the project tree, so local environment setup may not be ready.

## 4. Validation status

### Backend

- Backend has almost no request-level validation.
- `authService.register` and `authService.login` accept raw `req.body` values.
- `orderController.createOrder` forwards `req.body` directly into the service.
- `deliveryController` and other endpoints do not validate required fields, numeric values, or data shape.
- No schema validation library is used, and no explicit body checks are present.

### Frontend

- Login page currently validates only by comparing against hard-coded mock credentials.
- Form inputs generally lack strong client-side validation, email checks, password rules, and field-level feedback.
- Error handling is incomplete: pages often log errors to console instead of showing UI notifications.

## 5. Features that are still in progress or not fully wired

### Backend

- Admin routes are not mounted in the server.
- `/api/auth/refresh` missing.
- Notification service is stubbed and has TODOs for email/SMS integration.
- No `notifications` endpoint is currently visible in the backend route configuration.
- Admin analytics route exists in code but is not active.

### Frontend

- Many pages contain commented-out backend calls and notes like `// Ota käyttöön backend-vaiheessa`.
- `frontend/src/app/lib/api.ts` is written for a backend structure that does not yet match current server routes.
- `frontend/src/app/services/adminService.ts` expects `/api/admin/analytics/revenue` and `/api/notifications`, which are not deployed.
- Driver and delivery tracking pages appear built visually but may not yet use live backend tracking data.
- Settings / account management pages are not fully connected to backend endpoints.

## 6. Exact code files with the biggest issues

- `backend/server.js`
  - missing CORS
  - not mounting `adminRoutes`
  - uses `/api` instead of `/api/v1`
- `frontend/src/app/lib/api.ts`
  - base URL mismatch
  - refresh endpoint mismatch
  - uses cookie credentials but backend does not set cookies
- `frontend/src/app/contexts/AuthContext.tsx`
  - mock login instead of real backend auth
- `frontend/src/app/services/orderService.ts`
  - direct fetch to `/api/orders`; not using Axios client with unified API prefix
- `frontend/src/app/services/adminService.ts`
  - expects admin analytics and notifications API that is not wired in backend
- `backend/services/notificationService.js`
  - contains TODOs for actual email/SMS integration
- `backend/config/db.js`
  - relies on `.env`; project may need a root `.env` or docs for setup

## 7. Roadmap to completion

### Phase 1: Stabilize backend <-> frontend connectivity

1. Choose one API prefix and enforce it across the whole project.
   - Recommended: rename backend routes to `/api/v1` or change frontend `api.ts` to `/api`.
2. In `backend/server.js`:
   - import and mount `adminRoutes`.
   - add CORS support with `cors()`.
   - optionally add a unified `/api/v1` or `/api` prefix.
3. Implement auth refresh support or remove the refresh flow:
   - add `/auth/refresh` endpoint if you want token renewal.
   - OR simplify frontend to use one JWT token and expire session on 401.
4. Fix frontend service consistency:
   - use `frontend/src/app/lib/api.ts` everywhere, or make all fetches use the same base path.
   - remove inconsistent usage of `/api` and `/api/v1`.
5. Replace mock auth in `AuthContext.tsx` with real backend login/register calls.
   - store the returned JWT in localStorage.
   - preserve user data with backend user response.

### Phase 2: Implement missing backend endpoints and validation

1. Add required backend endpoints:
   - `/api/auth/refresh` or equivalent token refresh.
   - `/api/notifications` if frontend needs notifications.
   - any admin/order endpoints referenced by frontend that are currently absent.
2. Add request validation:
   - validate required fields for login/register/order creation.
   - validate numeric values, enums, email format.
   - reject malformed payloads early with 400 status.
3. Add a backend global error handler.
4. Harden auth middleware:
   - verify token presence and validity with clear errors.
   - optionally add `iat`, `exp`, `role`, and `user_id` checks.

### Phase 3: Wire frontend pages to real data

1. Update login/register pages to call backend services.
2. Update order-related pages to fetch data from `orderService`.
3. Update admin pages to fetch admin analytics via mounted admin routes.
4. Update delivery tracking pages to use live backend data instead of placeholder values.
5. Add toast/error UI and loading states across pages.
6. Remove or replace mock dataset patterns and commented-out backend imports.

### Phase 4: Polish and finish

1. Verify end-to-end flows:
   - customer register/login
   - customer order creation and order list
   - admin order assignment
   - driver assignment and status updates
   - delivery tracking updates
2. Test the full app in development with Vite and backend running together.
3. Build the frontend with `npm run build` and ensure no build errors.
4. Document setup and run steps clearly in `README.md`
   - backend `.env` configuration
   - database init/sql scripts
   - frontend `.env` / API URL settings
5. Add final validation and user-friendly error feedback.

## 8. Immediate first actions

1. Fix `backend/server.js` integration issues.
2. Fix `frontend/src/app/lib/api.ts` prefix to match backend.
3. Replace mock login/register in `AuthContext.tsx`.
4. Add CORS support in backend.
5. Add `/auth/refresh` or remove refresh handling.

## 9. Notes for the finish line

- The UI is far ahead of backend integration, so the main work is wiring and stability rather than designing new screens.
- Once the auth flow and API prefix are fixed, the rest of the app should fall into place quickly.
- Validation and better error handling are the last polish items after basic endpoints work.
