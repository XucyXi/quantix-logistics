# Project Analytics - Satvikille Delivery System

**Generated: May 1, 2026**

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Backend Structure & Analysis](#backend-structure--analysis)
5. [Frontend Structure & Analysis](#frontend-structure--analysis)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Security](#authentication--security)
9. [File Organization](#file-organization)
10. [Key Features & Workflows](#key-features--workflows)
11. [Configuration & Environment](#configuration--environment)
12. [Dependencies Analysis](#dependencies-analysis)

---

## PROJECT OVERVIEW

**Project Type**: Full-stack delivery/logistics management system
**Course**: Metropolia's Web-coding course
**Primary Use Cases**:

- Customer order management
- Driver delivery tracking
- Product management
- Admin analytics and control
- Real-time delivery tracking with geolocation

**Core Features**:

- Multi-role authentication (Customer, Driver, Admin)
- Product catalog with categories
- Order creation and management
- Real-time delivery tracking
- Customer dashboard
- Admin analytics
- Driver mobile interface

---

## TECHNOLOGY STACK

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Language**: JavaScript
- **Database**: MySQL 2 (v3.20.0)
- **Database Driver**: mysql2/promise

### Frontend

- **Library**: React (v19.2.5)
- **Language**: TypeScript (v6.0.2)
- **Build Tool**: Vite (v8.0.3)
- **Styling**: Tailwind CSS (v4.2.2)
- **Routing**: React Router (v7.13.2)
- **Maps**: Leaflet (v1.9.4) + MapLibre GL (v5.24.0)

### Key Libraries

**Backend**:

- bcrypt (v6.0.0) - Password hashing
- jsonwebtoken (v9.0.3) - JWT authentication
- dotenv (v17.3.1) - Environment configuration
- node-fetch (v3.3.2) - HTTP requests

**Frontend**:

- axios (v1.15.2) - HTTP client
- react-leaflet (v5.0.0-rc.2) - Map components
- recharts (v3.8.1) - Charts/analytics
- lucide-react (v1.7.0) - Icons
- radix-ui (v1.2.8) - UI components
- motion (v12.38.0) - Animations

### Development Tools

- ESLint (v9.15.0)
- Prettier (v3.3.3)
- TypeScript ESLint (@typescript-eslint/\*)
- Nodemon (v3.1.14)

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/TypeScript)             │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │   Customer   │    Driver    │    Admin     │             │
│  │  Dashboard   │  Dashboard   │  Dashboard   │             │
│  └──────────────┴──────────────┴──────────────┘             │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  Components (UI, Layouts, Pages)         │               │
│  │  Contexts (Auth, Cart, Theme, Toast)     │               │
│  │  Services (API calls, Admin ops)         │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP/REST API (Axios)
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js/Node.js)               │
│  ┌─────────────────────────────────────────┐               │
│  │  Routes & Controllers                   │               │
│  │  ├─ authRoutes       → authController   │               │
│  │  ├─ productRoutes    → productsController│              │
│  │  ├─ orderRoutes      → orderController   │               │
│  │  ├─ deliveryRoutes   → deliveryController│              │
│  │  └─ adminRoutes      → analyticsController│             │
│  └─────────────────────────────────────────┘               │
│                                                               │
│  ┌──────────────────────────────────────────┐              │
│  │  Middleware Layer                        │              │
│  │  ├─ authMiddleware (JWT verification)   │              │
│  │  └─ roleMiddleware (Role-based access)  │              │
│  └──────────────────────────────────────────┘              │
│                                                               │
│  ┌──────────────────────────────────────────┐              │
│  │  Services (Business Logic)               │              │
│  │  ├─ authService                          │              │
│  │  ├─ orderService                         │              │
│  │  ├─ deliveryService                      │              │
│  │  ├─ productsService                      │              │
│  │  ├─ notificationService                  │              │
│  │  └─ geocoder (Utilities)                 │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                          │ mysql2/promise
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
│                   (9+ Tables)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## BACKEND STRUCTURE & ANALYSIS

### Directory Structure

```
backend/
├── server.js                    # Main Express server entry point
├── package.json                 # Dependencies
├── test-connection.js           # Database connection test
├── config/
│   ├── db.js                   # Database pool configuration
│   ├── init.js                 # Database initialization
│   ├── create_tables.sql       # Database schema
│   ├── reset_tables.sql        # Clear tables script
│   ├── seed.sql                # Sample data
│   └── test_users_hash_init.js # Test user setup
├── controllers/                 # Business logic handlers
│   ├── authController.js       # Authentication logic
│   ├── orderController.js      # Order management
│   ├── productsController.js   # Product management
│   ├── deliveryController.js   # Delivery tracking
│   └── analyticsController.js  # Admin analytics
├── routes/                      # API route definitions
│   ├── authRoutes.js           # Auth endpoints
│   ├── productRoutes.js        # Product endpoints
│   ├── orderRoutes.js          # Order endpoints
│   ├── deliveryRoutes.js       # Delivery endpoints
│   └── adminRoutes.js          # Admin endpoints
├── middlewares/                 # Custom middleware
│   ├── authMiddleware.js       # JWT verification
│   └── roleMiddleware.js       # Role-based access control
├── services/                    # Business logic layer
│   ├── authService.js          # Auth operations
│   ├── orderService.js         # Order operations
│   ├── deliveryService.js      # Delivery operations
│   ├── productsService.js      # Product operations
│   ├── notificationService.js  # Notification handling
│   └── orderService.js         # Order service
├── utils/
│   └── geocoder.js             # Geolocation utilities
└── REST-CLIENT-TESTS/           # API testing files
    ├── orders.http
    ├── products.http
    └── test-delivery.http
```

### Key Backend Files Analysis

#### server.js

- Entry point for Express application
- Initializes middleware for JSON parsing
- Mounts four main route groups:
  - `/api/auth` - Authentication
  - `/api/products` - Products
  - `/api/orders` - Orders
  - `/api/deliveries` - Delivery tracking
- Runs on port 3000
- Includes request logging middleware

#### Controllers

**authController.js**

- Handles user registration and login
- Delegates to authService
- Returns JWT tokens and user data

**orderController.js**

- Create orders (customer)
- Get customer orders
- Get assigned orders (driver)
- Assign driver to order (admin)
- Update order status (driver)
- Get order statistics
- Integrates with notificationService for alerts

**productsController.js**

- Get all products (with authentication)
- Get product by ID
- Create product (admin only)
- Update product (admin only)

**deliveryController.js**

- Update delivery location (driver)
- Get tracking data (customer)

#### Services (Business Logic)

**authService.js**

- User registration with email/password hashing
- User login with JWT token generation
- Role-based user creation

**orderService.js**

- Create new orders
- Fetch customer orders
- Get driver-assigned orders
- Assign drivers automatically or manually
- Update order status
- Calculate order statistics

**deliveryService.js**

- Track delivery locations
- Update driver positions
- Get tracking information

**productsService.js**

- Product database operations
- Category management
- Stock management

**notificationService.js**

- Send notifications on order creation
- Notify admin of new orders
- Notify drivers of assignments
- User notification system

#### Middleware

**authMiddleware.js**

- Verifies JWT tokens from Authorization header
- Extracts user data from token (user_id, role)
- Returns 401 on missing/invalid token
- Attaches user info to request object

**roleMiddleware.js**

- Checks user role against required role
- Returns 403 Forbidden if role doesn't match
- Used with requireRole('admin'/'driver'/'customer')

---

## FRONTEND STRUCTURE & ANALYSIS

### Directory Structure

```
frontend/
├── package.json                # Dependencies and scripts
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.json                # Linting rules
├── index.html                 # HTML entry point
├── src/
│   ├── main.tsx               # React entry point
│   ├── vite-env.d.ts          # Vite TypeScript declarations
│   ├── app/
│   │   ├── App.tsx            # Root component with providers
│   │   ├── routes.tsx         # Route definitions
│   │   ├── components/        # Reusable components
│   │   │   ├── MasterTable.tsx
│   │   │   ├── OrderTrackingMap.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── delivery-tracking/
│   │   │   ├── figma/
│   │   │   └── layout/
│   │   ├── contexts/          # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── layouts/           # Page layout components
│   │   │   ├── AdminRoot.tsx
│   │   │   ├── DriverRoot.tsx
│   │   │   ├── Root.tsx
│   │   │   └── StoreRoot.tsx
│   │   ├── lib/
│   │   │   ├── api.ts         # API configuration (Axios)
│   │   │   └── pricing.ts     # Pricing calculations
│   │   ├── pages/             # Page components (30+ pages)
│   │   │   ├── AdminAnalytics.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminProductsPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── DriverDashboard.tsx
│   │   │   ├── DriverMapPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   └── (20+ more pages)
│   │   ├── services/          # API and business logic
│   │   │   ├── adminService.ts
│   │   │   └── orderService.ts
│   │   ├── ui/                # Shadcn/Radix UI components (40+ components)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── (30+ more UI components)
│   │   └── utils/             # Utility functions
│   ├── types/
│   │   ├── global.d.ts        # Global type declarations
│   │   └── logistics.ts       # Domain-specific types
│   ├── assets/
│   │   ├── data/              # Static data files
│   │   ├── images/            # Image assets
│   │   ├── styles/            # Global styles
│   │   └── videos/            # Video assets
│   └── declarations.d.ts      # Module declarations
├── public/
│   └── index.html             # Public HTML
└── .eslintrc.json             # ESLint configuration
```

### Key Frontend Components

**Contexts** (Global State Management):

- **AuthContext.tsx**: User authentication state, login/logout
- **CartContext.tsx**: Shopping cart management
- **ThemeProvider.tsx**: Dark/light theme switching
- **ToastContext.tsx**: Toast notifications

**Layouts** (Role-based layouts):

- **AdminRoot.tsx**: Admin dashboard layout
- **DriverRoot.tsx**: Driver interface layout
- **StoreRoot.tsx**: Store/merchant layout
- **Root.tsx**: Default layout

**Pages** (30+ pages covering):

- Authentication (Login, Register, Forgot Password)
- Customer features (Dashboard, Orders, Cart, Checkout, Tracking)
- Driver features (Dashboard, Deliveries, Map, Profile)
- Admin features (Analytics, Dashboard, Products, Users)
- Public pages (Landing, About, Pricing, Products, Routes)

**Components**:

- **MasterTable.tsx**: Reusable data table
- **OrderTrackingMap.tsx**: Real-time delivery tracking map
- **Sidebar.tsx**: Navigation sidebar
- Delivery tracking components
- Layout components

**Services**:

- **adminService.ts**: Admin API operations
- **orderService.ts**: Order API operations

**UI Components** (40+ Shadcn/Radix UI components):

- Form components (input, textarea, form, select)
- Display components (table, accordion, tabs)
- Dialog/modal components (dialog, drawer, alert-dialog)
- Navigation (breadcrumb, menubar, pagination)
- And 30+ more specialized UI components

---

## DATABASE SCHEMA

### Tables & Structure

#### 1. USERS (Identity Layer)

```
user_id (INT, PK, Auto-increment)
full_name (VARCHAR 255)
email (VARCHAR 255, UNIQUE)
password_hash (VARCHAR 255)
role (ENUM: 'customer', 'driver', 'admin')
created_at (TIMESTAMP)
last_login (TIMESTAMP)
```

**Indexes**: idx_user_role (role)

#### 2. CUSTOMER_PROFILES (Business Layer)

```
customer_id (INT, PK, Auto-increment)
user_id (INT, UNIQUE, FK → USERS)
company_name (VARCHAR 255)
address (VARCHAR 255)
tel (VARCHAR 50)
vat_number (VARCHAR 50)
tier (ENUM: 'starter', 'pro', 'enterprise')
discount_percentage (DECIMAL 5,2)
status (ENUM: 'pending', 'active', 'inactive')
```

#### 3. DRIVER_PROFILES (Business Layer)

```
driver_id (INT, PK, Auto-increment)
user_id (INT, UNIQUE, FK → USERS)
vehicle_info (VARCHAR 255)
active (BOOLEAN)
current_orders (INT)
max_orders (INT)
```

**Indexes**: idx_driver_active (active)

#### 4. CATEGORIES

```
category_id (INT, PK, Auto-increment)
name (VARCHAR 255, UNIQUE)
```

#### 5. PRODUCTS (Operations Layer)

```
product_id (INT, PK, Auto-increment)
name (VARCHAR 255)
description (TEXT)
base_price (DECIMAL 10,2)
stock_quantity (INT)
low_stock_threshold (INT)
product_added (TIMESTAMP)
product_exp (DATE)
```

**Indexes**: idx_products_stock (stock_quantity)

#### 6. PRODUCT_CATEGORIES (Many-to-Many)

```
product_id (INT, FK → PRODUCTS)
category_id (INT, FK → CATEGORIES)
PRIMARY KEY (product_id, category_id)
```

#### 7. ORDERS (Operations Layer)

```
order_id (INT, PK, Auto-increment)
customer_id (INT, FK → USERS)
driver_id (INT, FK → USERS)
status (ENUM: 'pending', 'assigned', 'in_progress', 'ready_for_pickup', 'in_transit', 'done', 'stuck')
delivery_address (VARCHAR 255)
notes (TEXT)
ordered_at (TIMESTAMP)
order_finished (TIMESTAMP)
total_price (DECIMAL 10,2)
```

**Indexes**:

- idx_orders_driver_status (driver_id, status)
- idx_orders_customer (customer_id)

#### 8. ORDER_ITEMS

```
order_item_id (INT, PK, Auto-increment)
order_id (INT, FK → ORDERS)
product_id (INT, FK → PRODUCTS)
quantity (INT)
unit_price (DECIMAL 10,2)
```

**Indexes**:

- idx_order_items_order (order_id)
- idx_order_items_product (product_id)

#### 9. DELIVERY_TRACKING

```
tracking_id (INT, PK, Auto-increment)
order_id (INT, FK → ORDERS)
status (ENUM: 'pending', 'assigned', 'in_progress', 'in_transit', 'done', 'stuck')
latitude (DECIMAL 10,6)
longitude (DECIMAL 10,6)
updated_at (TIMESTAMP)
```

**Indexes**: idx_tracking_order (order_id)

#### 10. ANNOUNCEMENTS

```
announcement_id (INT, PK, Auto-increment)
title (VARCHAR 255)
content (TEXT)
created_at (TIMESTAMP)
expires_at (TIMESTAMP)
```

#### 11. NOTIFICATIONS (User Notifications)

```
notification_id (INT, PK, Auto-increment)
user_id (INT, FK → USERS)
title (VARCHAR 255)
message (TEXT)
type (ENUM: 'info', 'success', 'warning', 'error')
created_at (TIMESTAMP)
read_at (TIMESTAMP)
```

**Indexes**:

- idx_notifications_user (user_id)
- idx_notifications_read (read_at)

### Data Relationships

```
USERS (1) ──→ (1) CUSTOMER_PROFILES
USERS (1) ──→ (1) DRIVER_PROFILES
USERS (1) ──→ (M) ORDERS (as customer)
USERS (1) ──→ (M) ORDERS (as driver)
USERS (1) ──→ (M) NOTIFICATIONS

ORDERS (1) ──→ (M) ORDER_ITEMS
ORDERS (1) ──→ (1) DELIVERY_TRACKING

PRODUCTS (M) ──→ (M) CATEGORIES (via PRODUCT_CATEGORIES)
PRODUCTS (1) ──→ (M) ORDER_ITEMS
```

---

## API ENDPOINTS

### Authentication Routes (`/api/auth`)

```
POST   /api/auth/register
- Body: { email, password, role, ...extraData }
- Response: { user_id, token, role }
- Auth Required: NO

POST   /api/auth/login
- Body: { email, password }
- Response: { user_id, token, role }
- Auth Required: NO

GET    /api/auth/test
- Response: { message, url, method }
- Auth Required: NO
```

### Products Routes (`/api/products`)

```
GET    /api/products
- Response: Array of products
- Auth Required: YES

GET    /api/products/:id
- Response: Single product details
- Auth Required: YES

POST   /api/products
- Body: Product data
- Auth Required: YES
- Role Required: admin

PUT    /api/products/:id
- Body: Updated product data
- Auth Required: YES
- Role Required: admin

GET    /api/products/test
- Response: { message, url, method }
- Auth Required: NO
```

### Orders Routes (`/api/orders`)

```
POST   /api/orders
- Body: { items[], delivery_address, notes }
- Response: { order_id, total_price, status }
- Auth Required: YES
- Role: customer

GET    /api/orders
- Query: (optional filters)
- Response: Array of customer orders
- Auth Required: YES
- Role: customer

GET    /api/orders/assigned
- Response: Array of assigned orders for driver
- Auth Required: YES
- Role: driver

GET    /api/orders/stats
- Response: Order statistics
- Auth Required: YES
- Role: customer

GET    /api/orders/:id
- Response: Single order details with items
- Auth Required: YES

PUT    /api/orders/:id/assign
- Body: { driver_id? } (optional, auto-assign if not provided)
- Response: { order_id, driver_id, status }
- Auth Required: YES
- Role: admin

PUT    /api/orders/:id/status
- Body: { status }
- Response: { order_id, status, updated_at }
- Auth Required: YES
- Role: driver
```

### Delivery Routes (`/api/deliveries`)

```
POST   /api/deliveries/:orderId/location
- Body: { latitude, longitude, timestamp? }
- Response: { tracking_id, status }
- Auth Required: YES
- Role: driver

GET    /api/deliveries/:orderId/status
- Response: { order_id, status, latitude, longitude, updated_at }
- Auth Required: YES
- Role: customer/driver
```

### Order Status Enum

- `pending` - Order created, awaiting assignment
- `assigned` - Driver assigned
- `in_progress` - Driver started delivery
- `ready_for_pickup` - Order ready for pickup
- `in_transit` - In transit to customer
- `done` - Delivery completed
- `stuck` - Delivery problematic/stuck

---

## AUTHENTICATION & SECURITY

### JWT Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Backend verifies credentials and generates JWT token
3. Client stores JWT in local storage/session storage
4. Client includes token in Authorization header: `Bearer <token>`
5. authMiddleware verifies token and attaches user data to request

### JWT Token Structure

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { user_id, role, iat, exp }
Signature: HS256(header + payload, JWT_SECRET)
```

### Security Features

- **Password Hashing**: bcrypt (6 salt rounds)
- **Token Secret**: JWT_SECRET from environment (devsecret for dev)
- **Role-Based Access Control**: roleMiddleware enforces role checks
- **Token Verification**: Checked on every protected endpoint

### Protected Routes

All routes under `/api/` require valid JWT token except:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/test`
- `GET /api/products/test`

### Role-Based Restrictions

- **Admin**: Product creation/updates, order assignment, analytics
- **Driver**: Order status updates, location tracking
- **Customer**: Order creation, order viewing, delivery tracking

---

## FILE ORGANIZATION

### Configuration Files

```
.env                          # Environment variables (not tracked)
.env.example                  # Example environment variables
.gitignore                    # Git ignore rules
.editorconfig                 # Editor configuration
.prettierrc.json              # Prettier formatting
.eslintrc.json                # ESLint rules
postcss.config.mjs            # PostCSS configuration
vite.config.ts                # Vite build config
tsconfig.json                 # TypeScript configuration
```

### Documentation Files

```
README.md                                    # Project overview & setup
PROJECT_ANALYTICS.md                         # Structured project analytics (this document)
docs/
└── backend/
    ├── API_DOCUMENTATION.md
    ├── API_QUICK_REFERENCE.md
    ├── API_TESTING_GUIDE.md
    ├── BACKEND_DOCUMENTATION_INDEX.md
    └── DATABASE_SCHEMA.md
```

### Scripts

```
npm start                    # Start backend server
npm run db:init             # Initialize database
```

### REST Testing Files

```
backend/REST-CLIENT-TESTS/
├── orders.http              # Order endpoint tests
├── products.http            # Product endpoint tests
└── test-delivery.http       # Delivery endpoint tests
```

---

## KEY FEATURES & WORKFLOWS

### 1. User Authentication Workflow

```
User Input (Email, Password, Role)
    ↓
authController.register/login()
    ↓
authService.register/login()
    ↓
Verify credentials / Hash password with bcrypt
    ↓
Create/Update USERS table entry
    ↓
Generate JWT token
    ↓
Return { user_id, token, role, ...profile_data }
```

### 2. Order Creation Workflow

```
Customer submits order (items, delivery_address)
    ↓
authMiddleware verifies JWT
    ↓
orderController.createOrder()
    ↓
orderService.createOrder()
    ↓
1. Insert ORDERS record
2. Insert ORDER_ITEMS records
3. Calculate total_price
4. Geocode delivery_address
    ↓
notificationService.notifyOrderCreated() [Customer]
notificationService.notifyAdminNewOrder() [Admin]
    ↓
Response: { order_id, total_price, status }
```

### 3. Driver Assignment Workflow

```
Admin triggers assignDriverToOrder()
    ↓
orderService.assignDriverToOrder()
    ↓
1. Select driver with lowest current_orders
2. Update ORDERS.driver_id
3. Update DRIVER_PROFILES.current_orders
4. Update DELIVERY_TRACKING status
    ↓
notificationService.notifyDriverAssignment() [Driver]
    ↓
Response: { order_id, driver_id, status: 'assigned' }
```

### 4. Real-time Delivery Tracking Workflow

```
Driver sends location update
    ↓
POST /api/deliveries/:orderId/location
    ↓
authMiddleware verifies driver JWT
    ↓
deliveryController.updateLocation()
    ↓
Update DELIVERY_TRACKING table
    ↓
Frontend polls/listens for updates
    ↓
Display driver location on map in real-time
```

### 5. Product Management Workflow

```
Admin creates/updates product
    ↓
POST/PUT /api/products
    ↓
roleMiddleware verifies admin role
    ↓
productsController.createProduct/updateProduct()
    ↓
productsService operations
    ↓
1. Insert/Update PRODUCTS
2. Update PRODUCT_CATEGORIES (many-to-many)
3. Manage stock_quantity
    ↓
Response: { product_id, name, price, categories[] }
```

### 6. Analytics Workflow

```
Admin views analytics dashboard
    ↓
Frontend calls adminService.getAnalytics()
    ↓
GET /api/admin/analytics
    ↓
analyticsController queries database
    ↓
1. Order statistics (count, avg price, status breakdown)
2. Revenue calculations
3. Driver performance
4. Customer trends
    ↓
Response: { stats, charts_data, trends }
```

---

## CONFIGURATION & ENVIRONMENT

### Environment Variables Required

```
# Database Configuration
DB_HOST=localhost           # MySQL host
DB_USER=root                # MySQL user
DB_PASS=password            # MySQL password
DB_NAME=database_name       # Database name

# Server Configuration
PORT=3000                   # Express server port
NODE_ENV=development        # Environment (development/production)

# Security
JWT_SECRET=your_secret_key  # JWT signing secret

# Optional API Keys
GEOCODING_API_KEY=          # For address geocoding
NOTIFICATION_API_KEY=       # For notifications
```

### Database Initialization

```bash
# Initialize database schema
npm run db:init

# This runs config/init.js which:
1. Creates database if not exists
2. Runs create_tables.sql
3. Optionally seeds test data from seed.sql
```

### Build & Deployment

**Frontend Build**:

```bash
npm run build    # Creates production bundle
npm run preview  # Preview production build locally
```

**Backend Start**:

```bash
npm start        # Runs server.js on port 3000
```

---

## DEPENDENCIES ANALYSIS

### Backend Dependencies (7 packages)

| Package      | Version | Purpose                              |
| ------------ | ------- | ------------------------------------ |
| express      | ^5.2.1  | Web framework                        |
| mysql2       | ^3.20.0 | MySQL database driver                |
| bcrypt       | ^6.0.0  | Password hashing                     |
| jsonwebtoken | ^9.0.3  | JWT token generation/verification    |
| dotenv       | ^17.3.1 | Environment variable management      |
| node-fetch   | ^3.3.2  | HTTP requests (API calls)            |
| nodemon      | ^3.1.14 | Development: auto-restart on changes |

### Frontend Dependencies (11 packages)

| Package                 | Version     | Purpose                      |
| ----------------------- | ----------- | ---------------------------- |
| react                   | ^19.2.5     | UI library                   |
| react-dom               | ^19.2.5     | React DOM rendering          |
| react-router            | ^7.13.2     | Routing library              |
| react-router-dom        | ^7.13.2     | DOM-specific routing         |
| axios                   | ^1.15.2     | HTTP client                  |
| leaflet                 | ^1.9.4      | Map library                  |
| react-leaflet           | ^5.0.0-rc.2 | React wrapper for Leaflet    |
| maplibre-gl             | ^5.24.0     | Vector map library           |
| recharts                | ^3.8.1      | Chart/visualization library  |
| lucide-react            | ^1.7.0      | Icon library                 |
| motion                  | ^12.38.0    | Animation library            |
| @radix-ui/react-tooltip | ^1.2.8      | Accessible tooltip component |

### Frontend DevDependencies (13 packages)

| Package                          | Version | Purpose                         |
| -------------------------------- | ------- | ------------------------------- |
| vite                             | ^8.0.3  | Build tool                      |
| @vitejs/plugin-react             | ^6.0.1  | React plugin for Vite           |
| typescript                       | ^6.0.2  | Language superset               |
| @tailwindcss/vite                | ^4.2.2  | Tailwind CSS plugin             |
| eslint                           | ^9.15.0 | Code linting                    |
| @typescript-eslint/parser        | ^8.24.0 | TypeScript ESLint parser        |
| @typescript-eslint/eslint-plugin | ^8.24.0 | TypeScript ESLint rules         |
| prettier                         | ^3.3.3  | Code formatter                  |
| eslint-config-prettier           | ^9.1.0  | Prettier integration for ESLint |

### UI Component Library

- **Shadcn/Radix UI**: 40+ pre-built accessible components
  - Form controls (button, input, select, textarea, checkbox, radio, etc.)
  - Display (table, accordion, tabs, carousel, etc.)
  - Dialog & modals (dialog, drawer, alert-dialog, etc.)
  - Navigation (breadcrumb, menubar, pagination, etc.)

---

## PROJECT STATISTICS

### Code Organization

- **Backend**: ~2,000+ lines of code
  - 5 controllers (~300+ lines each)
  - 5 services (~200+ lines each)
  - 5 route files (~50+ lines each)
  - 2 middleware files (~40 lines each)

- **Frontend**: ~10,000+ lines of code
  - 30+ page components (~200+ lines each)
  - 40+ UI components (shadcn/Radix)
  - 5 context providers (~150+ lines each)
  - 4 layout components (~100+ lines each)

### Database

- **11 tables** with proper relationships
- **15+ indexes** for query optimization
- **Multiple enum types** for status tracking

### Key Features Implemented

✓ Multi-role authentication (Customer, Driver, Admin)
✓ Product catalog with categories
✓ Shopping cart functionality
✓ Order creation and management
✓ Real-time delivery tracking with maps
✓ Driver assignment system
✓ Admin analytics dashboard
✓ Customer dashboard
✓ Notification system
✓ Geolocation integration
✓ Role-based access control
✓ JWT authentication

### Frontend Pages (30+)

- Landing & Public Pages (3)
- Authentication (3)
- Customer Pages (8)
- Driver Pages (5)
- Admin Pages (5)
- Utility Pages (6)

---

## TECHNICAL HIGHLIGHTS

### Architecture Patterns

1. **MVC Pattern** (Backend): Controllers → Services → Database
2. **React Context API** (Frontend): Global state management
3. **Service Layer Architecture**: Business logic separation
4. **Role-Based Access Control**: Middleware-enforced permissions
5. **RESTful API Design**: Standard HTTP methods and status codes

### Database Design

- Normalized schema with proper relationships
- Indexed columns for performance
- Enum types for status tracking
- Cascade delete for data integrity
- Foreign key constraints

### Security Practices

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based middleware enforcement
- Environment variable configuration
- HTTPS-ready (when deployed)

### Performance Considerations

- Database indexing on frequently queried columns
- JWT tokens for stateless authentication
- Pagination support (can be implemented)
- Optimized queries in service layer
- Map library optimizations (MapLibre GL)

---

## FUTURE ENHANCEMENT OPPORTUNITIES

1. **Real-time Features**
   - WebSocket integration for live updates
   - Push notifications
   - Chat functionality

2. **Payment Integration**
   - Stripe/PayPal integration
   - Invoice generation

3. **Advanced Analytics**
   - Machine learning predictions
   - Delivery optimization algorithms
   - Customer segmentation

4. **Mobile App**
   - React Native implementation
   - Offline-first architecture

5. **Scalability**
   - Database replication
   - Load balancing
   - Caching layer (Redis)
   - Microservices architecture

6. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - End-to-end tests (Cypress/Playwright)

---

**End of Project Analytics Document**
