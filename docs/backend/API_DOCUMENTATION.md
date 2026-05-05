# Quantix Logistics - Complete API Documentation

**Last Updated:** May 4, 2026  
**API Base URL:** `http://localhost:3000/api`  
**Version:** 1.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Products Endpoints](#products-endpoints)
4. [Orders Endpoints](#orders-endpoints)
5. [Delivery Endpoints](#delivery-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Categories Endpoints](#categories-endpoints)
8. [Users Endpoints](#users-endpoints)
9. [Error Handling](#error-handling)
10. [Data Models](#data-models)

---

## Authentication

### JWT Token Management

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

**Token Details:**

- **Issuer:** `authService.login()` and `authService.refresh()`
- **Expiration:** 24 hours
- **Secret:** `process.env.JWT_SECRET` (required in production)
- **Storage:** Client-side localStorage under key `quantix_token`

### JWT Payload

```json
{
  "user_id": 1,
  "role": "customer",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Role-Based Access Control (RBAC)

| Role         | Permissions                                                        |
| ------------ | ------------------------------------------------------------------ |
| **customer** | View own orders, update profile, create orders                     |
| **driver**   | View assigned orders, update delivery status, update availability  |
| **admin**    | Full access to all resources, analytics, user management, settings |

---

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Authentication:** None (Public)

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "role": "customer",
  "full_name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "user_id": 1,
  "email": "user@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400 Bad Request` - Invalid email format, weak password, or missing fields
- `400 Bad Request` - Email already exists

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Authentication:** None (Public)

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "user_id": 1,
  "email": "user@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "full_name": "John Doe"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid credentials

---

### 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer <expired_or_valid_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `401 Unauthorized` - No token provided
- `403 Forbidden` - Invalid or malformed token

---

### 4. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required (All roles)

**Response (200 OK):**

```json
{
  "success": true,
  "profile": {
    "user_id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - User not found

---

### 5. Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required (All roles)

**Request Body:**

```json
{
  "full_name": "John Updated",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "profile": {
    "user_id": 1,
    "full_name": "John Updated",
    "email": "newemail@example.com"
  }
}
```

---

### 6. Change Password

**Endpoint:** `PUT /api/auth/change-password`

**Authentication:** Required (All roles)

**Request Body:**

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

**Error Responses:**

- `400 Bad Request` - Current password incorrect or validation failed

---

## Products Endpoints

### 1. Get All Products

**Endpoint:** `GET /api/products`

**Authentication:** Required (All roles)

**Query Parameters:**

- None (returns all products)

**Response (200 OK):**

```json
[
  {
    "product_id": 1,
    "name": "Product A",
    "description": "Product description",
    "base_price": 29.99,
    "stock_quantity": 100,
    "product_added": "2026-04-01T10:00:00Z"
  },
  {
    "product_id": 2,
    "name": "Product B",
    "description": "Another product",
    "base_price": 49.99,
    "stock_quantity": 50,
    "product_added": "2026-04-02T10:00:00Z"
  }
]
```

---

### 2. Get Products with Cursor Pagination

**Endpoint:** `GET /api/products/cursor`

**Authentication:** Required (All roles)

**Query Parameters:**

- `cursor` (optional, default: 0) - Starting position
- `limit` (optional, default: 16) - Number of products per page

**Request Example:**

```
GET /api/products/cursor?cursor=0&limit=16
```

**Response (200 OK):**

```json
{
  "success": true,
  "products": [
    {
      "product_id": 1,
      "name": "Product A",
      "base_price": 29.99,
      "stock_quantity": 100
    }
  ],
  "next_cursor": 16,
  "has_more": true
}
```

---

### 3. Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Authentication:** Required (All roles)

**Path Parameters:**

- `id` (number) - Product ID

**Response (200 OK):**

```json
{
  "product_id": 1,
  "name": "Product A",
  "description": "Detailed product description",
  "base_price": 29.99,
  "stock_quantity": 100,
  "product_added": "2026-04-01T10:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Product not found

---

### 4. Create Product

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 39.99,
  "stock": 150,
  "categories": [1, 2]
}
```

**Alternative Format (backward compatibility):**

```json
{
  "name": "New Product",
  "description": "Product description",
  "base_price": 39.99,
  "stock_quantity": 150,
  "categories": [1, 2]
}
```

**Response (201 Created):**

```json
{
  "message": "Product created",
  "id": 5
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields (name, price)
- `403 Forbidden` - Insufficient permissions

---

### 5. Update Product

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Product ID

**Request Body:**

```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 45.99,
  "stock": 120,
  "categories": [1, 3]
}
```

**Response (200 OK):**

```json
{
  "message": "Product updated"
}
```

**Error Responses:**

- `404 Not Found` - Product not found
- `403 Forbidden` - Insufficient permissions

---

### 6. Delete Product

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Product ID

**Response (200 OK):**

```json
{
  "message": "Product deleted successfully",
  "id": 1
}
```

**Error Responses:**

- `404 Not Found` - Product not found
- `409 Conflict` - Product is tied to existing order history (cannot delete)
- `403 Forbidden` - Insufficient permissions

---

## Orders Endpoints

### 1. Create Order

**Endpoint:** `POST /api/orders`

**Authentication:** Required (All authenticated users)

**Request Body:**

```json
{
  "delivery_address": "123 Main St, City, ZIP",
  "notes": "Handle with care",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "order_id": 10,
  "status": "pending",
  "total_price": 109.97,
  "items_count": 2
}
```

**Error Responses:**

- `400 Bad Request` - No items in order, invalid quantity, or insufficient stock
- `400 Bad Request` - "Product X ei ole tarpeeksi varastossa" (Stock unavailable)

---

### 2. Get Order by ID

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required (All roles)

**Path Parameters:**

- `id` (number) - Order ID

**Response (200 OK):**

```json
{
  "order_id": 10,
  "customer_id": 1,
  "driver_id": 3,
  "status": "in_transit",
  "delivery_address": "123 Main St, City, ZIP",
  "notes": "Handle with care",
  "total_price": 109.97,
  "ordered_at": "2026-05-04T10:00:00Z",
  "order_finished": null,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 29.99
    }
  ]
}
```

**Error Responses:**

- `404 Not Found` - Order not found

---

### 3. Get Customer Orders

**Endpoint:** `GET /api/orders/customer/all`

**Authentication:** Required (Customer role)

**Query Parameters:**

- `limit` (optional, default: 20) - Number of orders
- `offset` (optional, default: 0) - Pagination offset
- `status` (optional) - Filter by status (pending, assigned, in_progress, ready_for_pickup, in_transit, done, cancelled)

**Request Example:**

```
GET /api/orders/customer/all?limit=20&offset=0&status=in_transit
```

**Response (200 OK):**

```json
{
  "success": true,
  "orders": [
    {
      "order_id": 10,
      "status": "in_transit",
      "delivery_address": "123 Main St, City, ZIP",
      "total_price": 109.97,
      "ordered_at": "2026-05-04T10:00:00Z"
    }
  ]
}
```

---

### 4. Get Customer Order Statistics

**Endpoint:** `GET /api/orders/customer/stats`

**Authentication:** Required (Customer role)

**Response (200 OK):**

```json
{
  "pending_count": 2,
  "in_transit_count": 1,
  "delivered_count": 15,
  "total_orders": 18,
  "avg_order_value": 75.5,
  "total_spent": 1359.0
}
```

---

### 5. Get Assigned Orders (Driver)

**Endpoint:** `GET /api/orders/driver/assigned`

**Authentication:** Required (Driver role)

**Response (200 OK):**

```json
[
  {
    "order_id": 10,
    "status": "assigned",
    "delivery_address": "123 Main St, City, ZIP",
    "notes": "Handle with care",
    "customer": {
      "company_name": "ABC Corporation",
      "tel": "555-1234"
    },
    "items": [
      {
        "name": "Product A",
        "quantity": 2
      }
    ]
  }
]
```

---

### 6. Update Order Status

**Endpoint:** `PUT /api/orders/:id/status`

**Authentication:** Required (Driver & Admin roles)

**Path Parameters:**

- `id` (number) - Order ID

**Request Body:**

```json
{
  "newStatus": "in_transit"
}
```

**Valid Status Values:**

- `pending` - Initial state
- `assigned` - Driver assigned
- `in_progress` - Being processed
- `ready_for_pickup` - Ready for delivery
- `in_transit` - On delivery route
- `done` - Delivered
- `cancelled` - Order cancelled

**Response (200 OK):**

```json
{
  "success": true,
  "status": "in_transit"
}
```

**Triggers:**

- Sends notification to customer when status changes
- Sends notification to driver on assignment

---

### 7. Assign Driver to Order

**Endpoint:** `PUT /api/orders/:id/assign`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Order ID

**Request Body:**

```json
{
  "driver_id": 3
}
```

**Response (200 OK):**

```json
{
  "message": "Driver assigned successfully",
  "status": "assigned"
}
```

**Automatic Behavior:**

- Order status changes to `assigned`
- 5 seconds later: Auto-transitions to `in_progress`
- 10 seconds later: Auto-transitions to `ready_for_pickup`
- Driver receives assignment notification

---

### 8. Cancel Order

**Endpoint:** `PUT /api/orders/:id/cancel`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Order ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

### 9. Update Driver Availability

**Endpoint:** `PUT /api/orders/driver/availability`

**Authentication:** Required (Driver only)

**Request Body:**

```json
{
  "active": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Availability updated"
}
```

---

### 10. Get Orders with Cursor Pagination

**Endpoint:** `GET /api/orders/cursor`

**Authentication:** Required (All roles)

**Query Parameters:**

- `cursor` (optional, default: 0) - Starting position
- `limit` (optional, default: 16) - Number of orders per page

**Response (200 OK):**

```json
{
  "success": true,
  "orders": [
    {
      "order_id": 10,
      "status": "in_transit",
      "total_price": 109.97,
      "ordered_at": "2026-05-04T10:00:00Z"
    }
  ],
  "next_cursor": 16,
  "has_more": true
}
```

---

### 11. Get All Orders (Admin)

**Endpoint:** `GET /api/orders/admin/all`

**Authentication:** Required (Admin only)

**Response (200 OK):**

```json
[
  {
    "order_id": 10,
    "customer_id": 1,
    "driver_id": 3,
    "status": "in_transit",
    "total_price": 109.97,
    "ordered_at": "2026-05-04T10:00:00Z",
    "delivery_address": "123 Main St, City, ZIP"
  }
]
```

---

### 12. Get All Drivers (Admin)

**Endpoint:** `GET /api/orders/admin/drivers`

**Authentication:** Required (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "drivers": [
    {
      "driver_id": 3,
      "user_id": 3,
      "full_name": "Driver Name",
      "vehicle_info": "Toyota Corolla",
      "active": true,
      "current_orders": 2,
      "max_orders": 5
    }
  ]
}
```

---

## Delivery Endpoints

### 1. Update Delivery Location

**Endpoint:** `POST /api/deliveries/:orderId/location`

**Authentication:** Required (Driver only)

**Path Parameters:**

- `orderId` (number) - Order ID

**Request Body:**

```json
{
  "latitude": 60.1699,
  "longitude": 24.9384
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "tracking_id": 42,
    "order_id": 10,
    "latitude": 60.1699,
    "longitude": 24.9384,
    "updated_at": "2026-05-04T10:30:00Z"
  }
}
```

---

### 2. Get Tracking Data

**Endpoint:** `GET /api/deliveries/:orderId/status`

**Authentication:** Required (All roles)

**Path Parameters:**

- `orderId` (number) - Order ID

**Response (200 OK):**

```json
{
  "status": "in_transit",
  "destination": {
    "lat": 60.1699,
    "lng": 24.9384
  },
  "driver": {
    "latitude": 60.175,
    "longitude": 24.945,
    "updated_at": "2026-05-04T10:30:00Z"
  }
}
```

---

## Admin Endpoints

### 1. Get Revenue Statistics

**Endpoint:** `GET /api/admin/analytics/revenue`

**Authentication:** Required (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "stats": {
    "total_revenue": 5432.5,
    "total_orders": 45,
    "avg_order_value": 120.72,
    "delivered": 38
  }
}
```

**Note:** Calculates stats for last 30 days

---

### 2. Get Order Statistics

**Endpoint:** `GET /api/admin/analytics/orders`

**Authentication:** Required (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "stats": [
    {
      "status": "pending",
      "count": 5
    },
    {
      "status": "in_transit",
      "count": 8
    },
    {
      "status": "done",
      "count": 38
    },
    {
      "status": "cancelled",
      "count": 2
    }
  ]
}
```

---

### 3. Update System Settings

**Endpoint:** `PUT /api/admin/settings/system`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "timezone": "Europe/Helsinki",
  "language": "fi"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "settings": {
    "timezone": "Europe/Helsinki",
    "language": "fi"
  }
}
```

---

### 4. Test SMTP Settings

**Endpoint:** `POST /api/admin/settings/smtp/test`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "smtpServer": "smtp.gmail.com",
  "senderAddress": "noreply@quantix.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "SMTP settings accepted for test"
}
```

**Error Responses:**

- `400 Bad Request` - Missing smtpServer or senderAddress

---

## Categories Endpoints

### 1. Get All Categories

**Endpoint:** `GET /api/categories`

**Authentication:** Required (All roles)

**Response (200 OK):**

```json
[
  {
    "category_id": 1,
    "name": "Electronics"
  },
  {
    "category_id": 2,
    "name": "Books"
  }
]
```

---

### 2. Create Category

**Endpoint:** `POST /api/categories`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "New Category"
}
```

**Response (201 Created):**

```json
{
  "category_id": 5,
  "name": "New Category"
}
```

**Error Responses:**

- `400 Bad Request` - Category name is required
- `400 Bad Request` - Category already exists

---

### 3. Update Category

**Endpoint:** `PUT /api/categories/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Category ID

**Request Body:**

```json
{
  "name": "Updated Category Name"
}
```

**Response (200 OK):**

```json
{
  "message": "Category updated"
}
```

---

### 4. Delete Category

**Endpoint:** `DELETE /api/categories/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - Category ID

**Response (200 OK):**

```json
{
  "message": "Category deleted"
}
```

**Error Responses:**

- `404 Not Found` - Category not found

---

## Users Endpoints

**Note:** All user endpoints require Admin authentication

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Authentication:** Required (Admin only)

**Response (200 OK):**

```json
[
  {
    "original_id": 1,
    "id": "U-001",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Asiakas",
    "lastLogin": "04.05.2026 15:30:00",
    "tier": "Pro",
    "activeOrders": null
  },
  {
    "original_id": 3,
    "id": "U-003",
    "name": "Driver Name",
    "email": "driver@example.com",
    "role": "Kuljettaja",
    "lastLogin": "04.05.2026 14:00:00",
    "tier": null,
    "activeOrders": 2
  }
]
```

**Role Mapping:**

- `customer` → "Asiakas"
- `driver` → "Kuljettaja"
- `admin` → "Admin"

---

### 2. Create User

**Endpoint:** `POST /api/users`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "role": "Asiakas",
  "tier": "Starter"
}
```

**Response (201 Created):**

```json
{
  "message": "User created successfully",
  "user_id": 5
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields
- `400 Bad Request` - Email already exists

---

### 3. Update User

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - User ID

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "NewPassword456",
  "role": "Kuljettaja",
  "tier": "Pro"
}
```

**Response (200 OK):**

```json
{
  "message": "User updated successfully"
}
```

---

### 4. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (number) - User ID

**Response (200 OK):**

```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**

- `404 Not Found` - User not found
- `500 Internal Server Error` - Failed to delete user (may have active orders)

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error description"
}
```

Or:

```json
{
  "error": "Error description"
}
```

### HTTP Status Codes

| Code  | Meaning               | Example                                          |
| ----- | --------------------- | ------------------------------------------------ |
| `200` | OK                    | Successful GET, PUT                              |
| `201` | Created               | Successful POST                                  |
| `400` | Bad Request           | Invalid data, missing fields, validation failure |
| `401` | Unauthorized          | Missing or invalid token                         |
| `403` | Forbidden             | Insufficient permissions, wrong role             |
| `404` | Not Found             | Resource not found                               |
| `409` | Conflict              | Foreign key constraint (product has orders)      |
| `500` | Internal Server Error | Database error, server error                     |

### Common Error Scenarios

**Missing Authentication Token:**

```json
{
  "success": false,
  "message": "No token provided"
}
```

**Invalid Token:**

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "jwt malformed"
}
```

**Insufficient Stock:**

```json
{
  "error": "Product X ei ole tarpeeksi varastossa"
}
```

**Duplicate Email:**

```json
{
  "error": "Email already exists"
}
```

---

## Data Models

### User Model

```json
{
  "user_id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "customer|driver|admin",
  "created_at": "2026-05-01T10:00:00Z",
  "last_login": "2026-05-04T15:30:00Z"
}
```

### Product Model

```json
{
  "product_id": 1,
  "name": "Product Name",
  "description": "Product description text",
  "base_price": 29.99,
  "stock_quantity": 100,
  "low_stock_threshold": 5,
  "product_added": "2026-04-01T10:00:00Z",
  "product_exp": "2026-12-31"
}
```

### Order Model

```json
{
  "order_id": 10,
  "customer_id": 1,
  "driver_id": 3,
  "status": "in_transit",
  "delivery_address": "123 Main St, City, ZIP",
  "notes": "Special delivery instructions",
  "total_price": 109.97,
  "ordered_at": "2026-05-04T10:00:00Z",
  "order_finished": null
}
```

### Order Item Model

```json
{
  "order_item_id": 1,
  "order_id": 10,
  "product_id": 1,
  "quantity": 2,
  "unit_price": 29.99
}
```

### Category Model

```json
{
  "category_id": 1,
  "name": "Electronics"
}
```

### Delivery Tracking Model

```json
{
  "tracking_id": 1,
  "order_id": 10,
  "latitude": 60.1699,
  "longitude": 24.9384,
  "updated_at": "2026-05-04T10:30:00Z"
}
```

---

## Rate Limiting

Currently not implemented. Recommended for production:

- 100 requests per minute per IP
- 50 requests per minute for auth endpoints
- 1000 requests per hour per authenticated user

---

## Versioning

Future versions may be available at `/api/v2`, `/api/v3`, etc.  
Current documentation covers **v1** (default).

---

## Support & Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in EUR by default
- Coordinates use decimal degrees (WGS 84)
- Phone numbers support international format
- Email validation is performed server-side
- Passwords are hashed with bcrypt (10 salt rounds)

---

**Last Updated:** May 4, 2026  
**Next Review:** May 18, 2026
