# Quantix Logistics - API Quick Reference

**Base URL:** `http://localhost:3000/api`

---

## 🔐 Authentication

All endpoints (except `/auth/register`, `/auth/login`, `/auth/test`) require JWT Bearer token:

```
Authorization: Bearer <token>
```

---

## 📋 Endpoint Summary

### Auth (`/api/auth`)

| Method | Endpoint           | Auth | Description                 |
| ------ | ------------------ | ---- | --------------------------- |
| `POST` | `/register`        | ❌   | Register new user           |
| `POST` | `/login`           | ❌   | Login and get token         |
| `POST` | `/refresh`         | ✅   | Refresh token               |
| `GET`  | `/profile`         | ✅   | Get current user profile    |
| `PUT`  | `/profile`         | ✅   | Update current user profile |
| `PUT`  | `/change-password` | ✅   | Change password             |

### Products (`/api/products`)

| Method   | Endpoint  | Auth | Role  | Description         |
| -------- | --------- | ---- | ----- | ------------------- |
| `GET`    | `/`       | ✅   | All   | List all products   |
| `GET`    | `/:id`    | ✅   | All   | Get product details |
| `GET`    | `/cursor` | ✅   | All   | Paginated products  |
| `POST`   | `/`       | ✅   | Admin | Create product      |
| `PUT`    | `/:id`    | ✅   | Admin | Update product      |
| `DELETE` | `/:id`    | ✅   | Admin | Delete product      |

### Orders (`/api/orders`)

| Method | Endpoint               | Auth | Role         | Description             |
| ------ | ---------------------- | ---- | ------------ | ----------------------- |
| `POST` | `/`                    | ✅   | All          | Create order            |
| `GET`  | `/:id`                 | ✅   | All          | Get order details       |
| `GET`  | `/cursor`              | ✅   | All          | Paginated orders        |
| `GET`  | `/customer/all`        | ✅   | Customer     | Get customer orders     |
| `GET`  | `/customer/stats`      | ✅   | Customer     | Get order statistics    |
| `GET`  | `/driver/assigned`     | ✅   | Driver       | Get assigned orders     |
| `GET`  | `/admin/all`           | ✅   | Admin        | Get all orders          |
| `GET`  | `/admin/drivers`       | ✅   | Admin        | Get all drivers         |
| `PUT`  | `/:id/status`          | ✅   | Driver/Admin | Update order status     |
| `PUT`  | `/:id/assign`          | ✅   | Admin        | Assign driver to order  |
| `PUT`  | `/:id/cancel`          | ✅   | Admin        | Cancel order            |
| `PUT`  | `/driver/availability` | ✅   | Driver       | Set driver availability |

### Deliveries (`/api/deliveries`)

| Method | Endpoint             | Auth | Role   | Description              |
| ------ | -------------------- | ---- | ------ | ------------------------ |
| `POST` | `/:orderId/location` | ✅   | Driver | Update delivery location |
| `GET`  | `/:orderId/status`   | ✅   | All    | Get tracking data        |

### Admin (`/api/admin`)

| Method | Endpoint              | Auth | Role  | Description            |
| ------ | --------------------- | ---- | ----- | ---------------------- |
| `GET`  | `/analytics/revenue`  | ✅   | Admin | Revenue stats (30d)    |
| `GET`  | `/analytics/orders`   | ✅   | Admin | Order status breakdown |
| `PUT`  | `/settings/system`    | ✅   | Admin | Update system settings |
| `POST` | `/settings/smtp/test` | ✅   | Admin | Test SMTP connection   |

### Categories (`/api/categories`)

| Method   | Endpoint | Auth | Role  | Description         |
| -------- | -------- | ---- | ----- | ------------------- |
| `GET`    | `/`      | ✅   | All   | List all categories |
| `POST`   | `/`      | ✅   | Admin | Create category     |
| `PUT`    | `/:id`   | ✅   | Admin | Update category     |
| `DELETE` | `/:id`   | ✅   | Admin | Delete category     |

### Users (`/api/users`) - Admin only

| Method   | Endpoint | Auth | Role  | Description    |
| -------- | -------- | ---- | ----- | -------------- |
| `GET`    | `/`      | ✅   | Admin | List all users |
| `POST`   | `/`      | ✅   | Admin | Create user    |
| `PUT`    | `/:id`   | ✅   | Admin | Update user    |
| `DELETE` | `/:id`   | ✅   | Admin | Delete user    |

---

## 🎯 Common Requests

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Order

```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "delivery_address": "123 Main St, City, ZIP",
  "notes": "Please ring doorbell",
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 3, "quantity": 1}
  ]
}
```

### Get Customer Orders

```bash
GET /api/orders/customer/all?limit=20&offset=0&status=in_transit
Authorization: Bearer <token>
```

### Update Order Status

```bash
PUT /api/orders/10/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "newStatus": "in_transit"
}
```

### Assign Driver

```bash
PUT /api/orders/10/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "driver_id": 3
}
```

### Update Delivery Location

```bash
POST /api/deliveries/10/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 60.1699,
  "longitude": 24.9384
}
```

### Get Revenue Analytics

```bash
GET /api/admin/analytics/revenue
Authorization: Bearer <token>
```

---

## ⚠️ Status Codes

| Code  | Meaning      |
| ----- | ------------ |
| `200` | Success      |
| `201` | Created      |
| `400` | Bad Request  |
| `401` | Unauthorized |
| `403` | Forbidden    |
| `404` | Not Found    |
| `409` | Conflict     |
| `500` | Server Error |

---

## 📊 Order Status Flow

```
pending → assigned → in_progress → ready_for_pickup → in_transit → done
                                                                   ↓
                                                              cancelled
```

---

## 👥 Roles

- **customer** - Can view own orders, create orders, update profile
- **driver** - Can view assigned orders, update status, set availability
- **admin** - Full access, analytics, user management

---

## 🔄 Query Parameters

### Pagination

- `limit` (default: 20 or 16) - Items per page
- `offset` (default: 0) - Starting position
- `cursor` (default: 0) - Cursor position

### Filtering

- `status` - Order status filter

---

## 📦 Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🛠️ Environment Variables

Required in `.env`:

- `PORT` (default: 3000)
- `DB_HOST`
- `DB_USER`
- `DB_PASS` or `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `ALLOWED_ORIGINS` (comma-separated)

---

## 📞 Support

For full documentation, see `API_DOCUMENTATION.md`
