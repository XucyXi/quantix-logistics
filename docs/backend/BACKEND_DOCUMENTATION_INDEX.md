# Backend Documentation Index

**Project:** Quantix Logistics Customer Portal  
**Backend:** Express.js + MySQL  
**Last Updated:** May 4, 2026

---

## 📚 Documentation Files

### 1. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API Reference

- **Purpose:** Comprehensive reference for all API endpoints
- **Audience:** Backend developers, frontend developers, API consumers
- **Content:**
  - Authentication & JWT token management
  - Complete endpoint documentation with:
    - Request/response examples
    - Query parameters
    - Error responses
    - Role-based access control
  - 7 main API modules:
    - Authentication (6 endpoints)
    - Products (6 endpoints)
    - Orders (13 endpoints)
    - Deliveries (2 endpoints)
    - Admin (4 endpoints)
    - Categories (4 endpoints)
    - Users (4 endpoints)
  - Data models and field descriptions
  - Error handling guide
  - Rate limiting recommendations
- **Read this when:** You need to understand how to call an endpoint or what response to expect

---

### 2. **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** - Quick Lookup Guide

- **Purpose:** Quick reference without deep explanations
- **Audience:** Developers who know the API and need quick lookups
- **Content:**
  - Summary table of all endpoints (method, path, auth, role, description)
  - Role definitions and permissions
  - HTTP status codes
  - Query parameter types
  - Response format examples
- **Read this when:** You're implementing a feature and need to quickly find the right endpoint

---

### 3. **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - Manual Testing & Examples

- **Purpose:** Hands-on testing guide with real request examples
- **Audience:** QA engineers, developers, API testers
- **Content:**
  - 50+ real HTTP request examples
  - Authentication flow walkthrough
  - Complete testing workflow
  - Common issues & solutions
  - Test data reference
  - Testing tips & best practices
  - All major endpoints with:
    - Sample requests
    - Expected responses
    - Alternative parameters
- **Read this when:** You're testing the API or need copy-paste examples for Postman/Insomnia

---

### 4. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Data Layer Documentation

- **Purpose:** Complete database structure reference
- **Audience:** Backend developers, database administrators
- **Content:**
  - Database diagram (ASCII art)
  - All 11 tables with:
    - Column definitions
    - Data types
    - Constraints
    - Relationships
    - Sample data
  - Enum value definitions
  - Index descriptions
  - Foreign key mapping
  - Common SQL queries
  - Data integrity constraints
  - Connection string example
- **Read this when:** You need to understand data structure or write database queries

---

## 🎯 API Overview

### Authentication

- **Register:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Refresh Token:** `POST /api/auth/refresh`
- **Profile Management:** `GET/PUT /api/auth/profile`
- **Password:** `PUT /api/auth/change-password`

### Products (Inventory Management)

- **List:** `GET /api/products` or `/cursor`
- **Details:** `GET /api/products/:id`
- **Create:** `POST /api/products` (Admin)
- **Update:** `PUT /api/products/:id` (Admin)
- **Delete:** `DELETE /api/products/:id` (Admin)

### Orders (Core Business Logic)

- **Create:** `POST /api/orders`
- **Get:** `GET /api/orders/:id`
- **Customer Orders:** `GET /api/orders/customer/all`
- **Customer Stats:** `GET /api/orders/customer/stats`
- **Driver Assigned:** `GET /api/orders/driver/assigned` (Driver)
- **Update Status:** `PUT /api/orders/:id/status`
- **Assign Driver:** `PUT /api/orders/:id/assign` (Admin)
- **Cancel:** `PUT /api/orders/:id/cancel` (Admin)
- **Driver Availability:** `PUT /api/orders/driver/availability` (Driver)
- **Admin View:** `GET /api/orders/admin/all` (Admin)
- **All Drivers:** `GET /api/orders/admin/drivers` (Admin)

### Deliveries (Real-time Tracking)

- **Update Location:** `POST /api/deliveries/:orderId/location` (Driver)
- **Get Status:** `GET /api/deliveries/:orderId/status`

### Admin Features

- **Revenue Analytics:** `GET /api/admin/analytics/revenue` (Admin)
- **Order Analytics:** `GET /api/admin/analytics/orders` (Admin)
- **System Settings:** `PUT /api/admin/settings/system` (Admin)
- **SMTP Test:** `POST /api/admin/settings/smtp/test` (Admin)

### Categories

- **List:** `GET /api/categories`
- **Create:** `POST /api/categories` (Admin)
- **Update:** `PUT /api/categories/:id` (Admin)
- **Delete:** `DELETE /api/categories/:id` (Admin)

### Users (Admin Management)

- **List:** `GET /api/users` (Admin)
- **Create:** `POST /api/users` (Admin)
- **Update:** `PUT /api/users/:id` (Admin)
- **Delete:** `DELETE /api/users/:id` (Admin)

**Total Endpoints:** 39 documented endpoints

---

## 📊 Database Tables

| Table                  | Purpose                  | Rows              | Key Relations                           |
| ---------------------- | ------------------------ | ----------------- | --------------------------------------- |
| **USERS**              | User accounts & auth     | N users           | PK for profiles, orders                 |
| **CUSTOMER_PROFILES**  | Customer data            | N customers       | FK → USERS                              |
| **DRIVER_PROFILES**    | Driver data              | N drivers         | FK → USERS                              |
| **PRODUCTS**           | Product catalog          | N products        | FK from ORDER_ITEMS                     |
| **CATEGORIES**         | Product categories       | N categories      | M:N via PRODUCT_CATEGORIES              |
| **PRODUCT_CATEGORIES** | Product-category mapping | N mappings        | M:N junction                            |
| **ORDERS**             | Orders & shipments       | N orders          | FK: customer, driver; FK to ORDER_ITEMS |
| **ORDER_ITEMS**        | Order line items         | N items           | FK: order, product                      |
| **DELIVERY_TRACKING**  | GPS tracking points      | N tracking points | FK → ORDERS                             |
| **ANNOUNCEMENTS**      | System announcements     | N announcements   | Standalone                              |
| **NOTIFICATIONS**      | User notifications       | N notifications   | FK → USERS                              |

---

## 🔐 Authentication & Authorization

### Token Management

- **Token Type:** JWT (JSON Web Token)
- **Expiration:** 24 hours
- **Refresh:** Use `POST /api/auth/refresh` to get new token
- **Storage:** Client-side localStorage with key `quantix_token`

### Roles & Permissions

| Role         | Capabilities                                                                    |
| ------------ | ------------------------------------------------------------------------------- |
| **customer** | View own orders, create orders, update profile, browse products                 |
| **driver**   | View assigned orders, update delivery status, track locations, set availability |
| **admin**    | Full access - users, products, orders, analytics, settings                      |

### Protected Routes

- All routes except `/auth/register`, `/auth/login`, `/auth/test` require:
  - Valid JWT token in `Authorization: Bearer <token>` header
  - Matching user role for role-restricted endpoints

---

## 🚀 Getting Started

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

### 2. Run Migrations/Initialize Database

```bash
# Connect to MySQL and run:
node config/init.js
```

### 3. Test API

Use one of these tools:

- **VS Code REST Client:** Use examples from `REST-CLIENT-TESTS/`
- **Postman/Insomnia:** Import requests from API_TESTING_GUIDE.md
- **cURL:** Copy-paste requests from API_TESTING_GUIDE.md

### 4. Check Environment Variables

Ensure `.env` file has:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=quantix_db
JWT_SECRET=your_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 📁 File Structure

```
backend/
├── server.js                      # Express app entry point
├── package.json                   # Dependencies & scripts
├── config/
│   ├── db.js                      # Database connection
│   ├── init.js                    # Database initialization
│   ├── create_tables.sql          # Schema definition
│   └── seed.sql                   # Sample data
├── routes/
│   ├── authRoutes.js              # Auth endpoints
│   ├── productRoutes.js           # Product endpoints
│   ├── orderRoutes.js             # Order endpoints
│   ├── deliveryRoutes.js          # Delivery endpoints
│   ├── adminRoutes.js             # Admin endpoints
│   ├── categoryRoutes.js          # Category endpoints
│   └── userRoutes.js              # User management
├── controllers/
│   ├── authController.js
│   ├── productsController.js
│   ├── orderController.js
│   ├── deliveryController.js
│   ├── analyticsController.js
│   ├── settingsController.js
│   ├── categoryController.js
│   └── userController.js
├── services/
│   ├── authService.js
│   ├── productsService.js
│   ├── orderService.js
│   ├── deliveryService.js
│   ├── notificationService.js
│   └── userService.js
├── middlewares/
│   ├── authMiddleware.js          # JWT verification
│   └── roleMiddleware.js          # Role checking
├── utils/
│   └── geocoder.js                # Location services
└── REST-CLIENT-TESTS/
    ├── products.http
    ├── orders.http
    └── test-delivery.http
```

---

## 🔄 Typical API Flow

### Customer Order Flow

```
1. Customer registers/logs in
   → POST /api/auth/register or /login
   → Returns JWT token

2. Browse products
   → GET /api/products
   → GET /api/products/:id

3. Create order
   → POST /api/orders
   → Includes delivery address & items
   → Returns order_id

4. Track order
   → GET /api/orders/:id
   → GET /api/deliveries/:id/status (real-time)

5. View order history
   → GET /api/orders/customer/all
   → GET /api/orders/customer/stats
```

### Driver Delivery Flow

```
1. Driver logs in
   → POST /api/auth/login
   → Returns JWT token

2. View assigned deliveries
   → GET /api/orders/driver/assigned

3. Update delivery status
   → PUT /api/orders/:id/status
   → Status: in_transit → done

4. Update location (GPS)
   → POST /api/deliveries/:orderId/location
   → Includes latitude & longitude

5. Manage availability
   → PUT /api/orders/driver/availability
   → Toggle active status
```

### Admin Management Flow

```
1. Admin logs in
   → POST /api/auth/login (admin account)

2. View analytics
   → GET /api/admin/analytics/revenue
   → GET /api/admin/analytics/orders

3. Manage orders
   → GET /api/orders/admin/all
   → PUT /api/orders/:id/assign (assign driver)
   → PUT /api/orders/:id/cancel (cancel order)

4. Manage products
   → GET/POST/PUT/DELETE /api/products

5. Manage users
   → GET/POST/PUT/DELETE /api/users

6. System configuration
   → PUT /api/admin/settings/system
   → POST /api/admin/settings/smtp/test
```

---

## 🧪 Testing Checklist

- [ ] Authentication (register, login, refresh)
- [ ] Product CRUD operations
- [ ] Order creation with multiple items
- [ ] Order status transitions
- [ ] Driver assignment & auto-transitions
- [ ] Delivery location tracking
- [ ] Customer order filtering by status
- [ ] Admin analytics endpoints
- [ ] User management (CRUD)
- [ ] Error responses (400, 401, 403, 404, 500)
- [ ] Role-based access control
- [ ] Pagination (limit, offset, cursor)

---

## 🐛 Debugging Tips

1. **Enable Server Logging:**
   - Check console output for detailed request logs
   - All requests log: `Incoming request: {METHOD} {URL}`

2. **Test Database Connection:**

   ```bash
   node test-connection.js
   ```

3. **Check JWT Token:**
   - Use jwt.io to decode and validate token
   - Verify role and expiration

4. **Verify CORS:**
   - Check ALLOWED_ORIGINS in .env
   - Frontend must be in allowed origins list

5. **Database Issues:**
   - Check MySQL is running
   - Verify credentials in .env
   - Run `node config/init.js` to recreate tables

---

## 📞 Support & References

### Common Status Codes

- `200` OK - Successful GET, PUT
- `201` Created - Successful POST
- `400` Bad Request - Invalid data
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

### Links

- API Documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Quick Reference: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- Testing Guide: [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
- Database Schema: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## 📈 Performance Notes

### Recommended Optimizations

- [ ] Add request validation layer (Joi/Zod/express-validator)
- [ ] Implement rate limiting middleware
- [ ] Add request caching (Redis) for frequently accessed data
- [ ] Optimize N+1 queries in order details
- [ ] Add database query logging in development

### Current Performance

- Most endpoints: < 100ms (simple queries)
- Complex queries: < 300ms (orders with items, analytics)
- No query optimization currently implemented

---

**Documentation Version:** 1.0  
**Last Updated:** May 4, 2026  
**Backend Version:** 1.0  
**API Version:** 1.0
