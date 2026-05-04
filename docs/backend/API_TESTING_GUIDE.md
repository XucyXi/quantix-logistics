# API Testing Guide - Manual Testing Examples

Use this guide with REST client tools (Postman, Insomnia, VS Code REST Client Extension, etc.)

---

## 🔐 Authentication Flow

### 1. Register New User

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123!",
  "role": "customer",
  "full_name": "Test User"
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "user_id": 10,
  "email": "testuser@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token for subsequent requests!**

---

### 2. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

---

### 3. Get Profile

```http
GET http://localhost:3000/api/auth/profile
Authorization: Bearer {TOKEN_FROM_LOGIN}
```

---

### 4. Update Profile

```http
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

### 5. Change Password

```http
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json

{
  "currentPassword": "TestPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

## 📦 Products Testing

### 1. Get All Products

```http
GET http://localhost:3000/api/products
Authorization: Bearer {TOKEN}
```

---

### 2. Get Product with Cursor Pagination

```http
GET http://localhost:3000/api/products/cursor?cursor=0&limit=10
Authorization: Bearer {TOKEN}
```

---

### 3. Get Product by ID

```http
GET http://localhost:3000/api/products/1
Authorization: Bearer {TOKEN}
```

---

### 4. Create Product (Admin only)

```http
POST http://localhost:3000/api/products
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Test Product",
  "description": "A test product for the API",
  "price": 49.99,
  "stock": 100,
  "categories": [1, 2]
}
```

---

### 5. Update Product (Admin only)

```http
PUT http://localhost:3000/api/products/1
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 59.99,
  "stock": 120,
  "categories": [1]
}
```

---

### 6. Delete Product (Admin only)

```http
DELETE http://localhost:3000/api/products/1
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 🛒 Orders Testing

### 1. Create Order

```http
POST http://localhost:3000/api/orders
Authorization: Bearer {CUSTOMER_TOKEN}
Content-Type: application/json

{
  "delivery_address": "123 Main Street, Helsinki 00100, Finland",
  "notes": "Please ring doorbell twice",
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

**Expected Response (201):**

```json
{
  "success": true,
  "order_id": 25,
  "status": "pending",
  "total_price": 129.97,
  "items_count": 2
}
```

---

### 2. Get Order by ID

```http
GET http://localhost:3000/api/orders/25
Authorization: Bearer {TOKEN}
```

---

### 3. Get Customer Orders

```http
GET http://localhost:3000/api/orders/customer/all?limit=10&offset=0
Authorization: Bearer {CUSTOMER_TOKEN}
```

---

### 4. Get Customer Orders by Status

```http
GET http://localhost:3000/api/orders/customer/all?status=in_transit
Authorization: Bearer {CUSTOMER_TOKEN}
```

---

### 5. Get Customer Order Statistics

```http
GET http://localhost:3000/api/orders/customer/stats
Authorization: Bearer {CUSTOMER_TOKEN}
```

---

### 6. Get Orders with Cursor Pagination

```http
GET http://localhost:3000/api/orders/cursor?cursor=0&limit=10
Authorization: Bearer {TOKEN}
```

---

### 7. Update Order Status (Driver/Admin)

```http
PUT http://localhost:3000/api/orders/25/status
Authorization: Bearer {DRIVER_OR_ADMIN_TOKEN}
Content-Type: application/json

{
  "newStatus": "in_transit"
}
```

**Valid status transitions:**

- pending → assigned
- assigned → in_progress
- in_progress → ready_for_pickup
- ready_for_pickup → in_transit
- in_transit → done

---

### 8. Assign Driver to Order (Admin only)

```http
PUT http://localhost:3000/api/orders/25/assign
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "driver_id": 3
}
```

**Note:** This triggers automatic status transitions:

- Assigned → 5 seconds → in_progress → 5 seconds → ready_for_pickup

---

### 9. Cancel Order (Admin only)

```http
PUT http://localhost:3000/api/orders/25/cancel
Authorization: Bearer {ADMIN_TOKEN}
```

---

### 10. Get Assigned Orders (Driver only)

```http
GET http://localhost:3000/api/orders/driver/assigned
Authorization: Bearer {DRIVER_TOKEN}
```

---

### 11. Set Driver Availability (Driver only)

```http
PUT http://localhost:3000/api/orders/driver/availability
Authorization: Bearer {DRIVER_TOKEN}
Content-Type: application/json

{
  "active": true
}
```

---

### 12. Get All Orders (Admin only)

```http
GET http://localhost:3000/api/orders/admin/all
Authorization: Bearer {ADMIN_TOKEN}
```

---

### 13. Get All Drivers (Admin only)

```http
GET http://localhost:3000/api/orders/admin/drivers
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 🚚 Delivery Tracking Testing

### 1. Update Delivery Location (Driver only)

```http
POST http://localhost:3000/api/deliveries/25/location
Authorization: Bearer {DRIVER_TOKEN}
Content-Type: application/json

{
  "latitude": 60.1699,
  "longitude": 24.9384
}
```

---

### 2. Get Tracking Data

```http
GET http://localhost:3000/api/deliveries/25/status
Authorization: Bearer {TOKEN}
```

---

## 📊 Admin Analytics Testing

### 1. Get Revenue Statistics

```http
GET http://localhost:3000/api/admin/analytics/revenue
Authorization: Bearer {ADMIN_TOKEN}
```

---

### 2. Get Order Statistics

```http
GET http://localhost:3000/api/admin/analytics/orders
Authorization: Bearer {ADMIN_TOKEN}
```

---

## ⚙️ Settings Testing

### 1. Update System Settings (Admin only)

```http
PUT http://localhost:3000/api/admin/settings/system
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "timezone": "Europe/Helsinki",
  "language": "fi"
}
```

---

### 2. Test SMTP (Admin only)

```http
POST http://localhost:3000/api/admin/settings/smtp/test
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "smtpServer": "smtp.gmail.com",
  "senderAddress": "noreply@quantix.com"
}
```

---

## 📂 Categories Testing

### 1. Get All Categories

```http
GET http://localhost:3000/api/categories
Authorization: Bearer {TOKEN}
```

---

### 2. Create Category (Admin only)

```http
POST http://localhost:3000/api/categories
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "New Category"
}
```

---

### 3. Update Category (Admin only)

```http
PUT http://localhost:3000/api/categories/1
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Updated Category Name"
}
```

---

### 4. Delete Category (Admin only)

```http
DELETE http://localhost:3000/api/categories/1
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 👥 Users Management (Admin only)

### 1. Get All Users

```http
GET http://localhost:3000/api/users
Authorization: Bearer {ADMIN_TOKEN}
```

---

### 2. Create User

```http
POST http://localhost:3000/api/users
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "role": "Asiakas",
  "tier": "Pro"
}
```

---

### 3. Update User

```http
PUT http://localhost:3000/api/users/5
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Updated User Name",
  "email": "updated@example.com",
  "role": "Kuljettaja",
  "tier": "Enterprise"
}
```

---

### 4. Delete User

```http
DELETE http://localhost:3000/api/users/5
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 🧪 Complete Testing Workflow

Follow this sequence to test the full flow:

1. **Register a customer**

   ```
   POST /api/auth/register
   ```

   Save the token

2. **Get products**

   ```
   GET /api/products
   ```

   Note some product IDs

3. **Create an order**

   ```
   POST /api/orders
   With the product IDs from step 2
   ```

   Save the order_id

4. **Get customer orders**

   ```
   GET /api/orders/customer/all
   ```

5. **(As Admin) Assign driver**

   ```
   PUT /api/orders/{order_id}/assign
   With driver_id
   ```

6. **(As Driver) Get assigned orders**

   ```
   GET /api/orders/driver/assigned
   ```

7. **(As Driver) Update delivery location**

   ```
   POST /api/deliveries/{order_id}/location
   With latitude and longitude
   ```

8. **(As Driver) Update order status**

   ```
   PUT /api/orders/{order_id}/status
   Change to in_transit, then done
   ```

9. **(As Customer) Get tracking data**

   ```
   GET /api/deliveries/{order_id}/status
   ```

10. **(As Admin) Get analytics**
    ```
    GET /api/admin/analytics/revenue
    GET /api/admin/analytics/orders
    ```

---

## 💡 Testing Tips

1. **Use environment variables** to store tokens:

   ```
   CUSTOMER_TOKEN = "eyJh..."
   ADMIN_TOKEN = "eyJh..."
   DRIVER_TOKEN = "eyJh..."
   ```

2. **Test error cases:**
   - Missing required fields
   - Invalid token
   - Wrong role (403 Forbidden)
   - Non-existent resources (404)

3. **Check response times** - should be < 200ms for most endpoints

4. **Validate data types** in responses

5. **Test pagination:**
   - Start with `cursor=0, limit=5`
   - Use returned `next_cursor` for next page

6. **Monitor server logs** while testing

---

## 📋 Test Data Reference

**Demo User Logins:**

- Customer: `customer@example.com` / `password`
- Driver: `driver@example.com` / `password`
- Admin: `admin@example.com` / `password`

**Common IDs:**

- Product: 1, 2, 3
- Category: 1, 2
- Driver: 3, 4
- Admin User: 1

---

## 🚨 Common Issues

| Issue            | Solution                             |
| ---------------- | ------------------------------------ |
| 401 Unauthorized | Check token is valid and not expired |
| 403 Forbidden    | Check user role has permission       |
| 404 Not Found    | Check resource ID exists             |
| CORS Error       | Check ALLOWED_ORIGINS in .env        |
| Database Error   | Check DB connection in .env          |

---

## 📚 Files

- REST Client tests: `backend/REST-CLIENT-TESTS/`
  - `products.http`
  - `orders.http`
  - `test-delivery.http`

---

**Last Updated:** May 4, 2026
