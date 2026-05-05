# Database Schema & Data Models Documentation

**Database:** MySQL 8.0+  
**Driver:** mysql2/promise

---

## Table of Contents

1. [Database Diagram](#database-diagram)
2. [Tables & Relationships](#tables--relationships)
3. [Field Descriptions](#field-descriptions)
4. [Enum Values](#enum-values)
5. [Indexes](#indexes)
6. [Foreign Keys](#foreign-keys)

---

## Database Diagram

```
USERS (Identity)
├─→ CUSTOMER_PROFILES
├─→ DRIVER_PROFILES
├─→ (Order customer_id FK)
├─→ (Order driver_id FK)
└─→ NOTIFICATIONS

CATEGORIES
└─→ PRODUCT_CATEGORIES

PRODUCTS
├─→ PRODUCT_CATEGORIES
└─→ ORDER_ITEMS

ORDERS
├─→ ORDER_ITEMS
└─→ DELIVERY_TRACKING
```

---

## Tables & Relationships

### 1. USERS (Core Identity Layer)

**Description:** All system users (customers, drivers, admins)

| Column          | Type         | Constraints                  | Description                         |
| --------------- | ------------ | ---------------------------- | ----------------------------------- |
| `user_id`       | INT          | PRIMARY KEY, AUTO_INCREMENT  | Unique user identifier              |
| `full_name`     | VARCHAR(255) | NOT NULL                     | User's display name                 |
| `email`         | VARCHAR(255) | NOT NULL, UNIQUE             | Login email address                 |
| `password_hash` | VARCHAR(255) | NOT NULL                     | bcrypt hashed password (10 rounds)  |
| `role`          | ENUM         | NOT NULL, DEFAULT 'customer' | User role (customer, driver, admin) |
| `created_at`    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP    | Account creation date               |
| `last_login`    | TIMESTAMP    | NULL                         | Last successful login timestamp     |

**Indexes:**

- `idx_user_role` - For filtering by role

**Foreign Key Dependents:**

- `CUSTOMER_PROFILES.user_id` (1:1)
- `DRIVER_PROFILES.user_id` (1:1)
- `ORDERS.customer_id` (1:N)
- `ORDERS.driver_id` (1:N)
- `NOTIFICATIONS.user_id` (1:N)

**Sample Data:**

```sql
INSERT INTO USERS (full_name, email, password_hash, role)
VALUES (
  'John Doe',
  'john@example.com',
  '$2b$10$...',
  'customer'
);
```

---

### 2. CUSTOMER_PROFILES (Business Layer)

**Description:** Extended profile data for customer users

| Column                | Type         | Constraints                  | Description                                  |
| --------------------- | ------------ | ---------------------------- | -------------------------------------------- |
| `customer_id`         | INT          | PRIMARY KEY, AUTO_INCREMENT  | Profile identifier                           |
| `user_id`             | INT          | NOT NULL, UNIQUE, FK → USERS | Link to USERS table                          |
| `company_name`        | VARCHAR(255) | NULL                         | Company/business name                        |
| `address`             | VARCHAR(255) | NULL                         | Business address                             |
| `tel`                 | VARCHAR(50)  | NULL                         | Business phone number                        |
| `vat_number`          | VARCHAR(50)  | NULL                         | VAT/Tax ID                                   |
| `tier`                | ENUM         | DEFAULT 'starter'            | Subscription tier (starter, pro, enterprise) |
| `discount_percentage` | DECIMAL(5,2) | DEFAULT 0.00                 | Volume/loyalty discount                      |
| `status`              | ENUM         | DEFAULT 'pending'            | Profile status (pending, active, inactive)   |

**Cascade:** ON DELETE CASCADE from USERS

**Sample Data:**

```sql
INSERT INTO CUSTOMER_PROFILES (user_id, company_name, tier, status)
VALUES (1, 'ABC Corporation', 'pro', 'active');
```

---

### 3. DRIVER_PROFILES (Business Layer)

**Description:** Extended profile data for driver users

| Column           | Type         | Constraints                  | Description                          |
| ---------------- | ------------ | ---------------------------- | ------------------------------------ |
| `driver_id`      | INT          | PRIMARY KEY, AUTO_INCREMENT  | Profile identifier                   |
| `user_id`        | INT          | NOT NULL, UNIQUE, FK → USERS | Link to USERS table                  |
| `vehicle_info`   | VARCHAR(255) | NULL                         | Vehicle details (make, model, plate) |
| `active`         | BOOLEAN      | DEFAULT TRUE                 | Currently available for deliveries   |
| `current_orders` | INT          | DEFAULT 0                    | Active delivery count                |
| `max_orders`     | INT          | DEFAULT 5                    | Maximum concurrent deliveries        |

**Indexes:**

- `idx_driver_active` - For finding available drivers

**Cascade:** ON DELETE CASCADE from USERS

**Sample Data:**

```sql
INSERT INTO DRIVER_PROFILES (user_id, vehicle_info, active, max_orders)
VALUES (3, 'Toyota Corolla - ABC123', TRUE, 5);
```

---

### 4. CATEGORIES (Product Organization)

**Description:** Product categories for classification

| Column        | Type         | Constraints                 | Description         |
| ------------- | ------------ | --------------------------- | ------------------- |
| `category_id` | INT          | PRIMARY KEY, AUTO_INCREMENT | Category identifier |
| `name`        | VARCHAR(255) | NOT NULL, UNIQUE            | Category name       |

**Foreign Key Dependents:**

- `PRODUCT_CATEGORIES.category_id` (1:N)

**Sample Data:**

```sql
INSERT INTO CATEGORIES (name) VALUES ('Electronics');
INSERT INTO CATEGORIES (name) VALUES ('Books');
```

---

### 5. PRODUCTS (Inventory)

**Description:** Product catalog

| Column                | Type          | Constraints                 | Description                     |
| --------------------- | ------------- | --------------------------- | ------------------------------- |
| `product_id`          | INT           | PRIMARY KEY, AUTO_INCREMENT | Product identifier              |
| `name`                | VARCHAR(255)  | NOT NULL                    | Product name                    |
| `description`         | TEXT          | NULL                        | Detailed product description    |
| `base_price`          | DECIMAL(10,2) | NOT NULL                    | Selling price (EUR)             |
| `stock_quantity`      | INT           | DEFAULT 0                   | Available units in inventory    |
| `low_stock_threshold` | INT           | DEFAULT 5                   | Alert level for low stock       |
| `product_added`       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP   | When product was added          |
| `product_exp`         | DATE          | NULL                        | Expiration/discontinuation date |

**Indexes:**

- `idx_products_stock` - For inventory queries

**Foreign Key Dependents:**

- `PRODUCT_CATEGORIES.product_id` (1:N)
- `ORDER_ITEMS.product_id` (1:N)

**Sample Data:**

```sql
INSERT INTO PRODUCTS (name, base_price, stock_quantity, description)
VALUES ('Laptop', 799.99, 50, 'High-performance computing device');
```

---

### 6. PRODUCT_CATEGORIES (M:N Junction)

**Description:** Maps products to multiple categories

| Column        | Type | Constraints                  | Description        |
| ------------- | ---- | ---------------------------- | ------------------ |
| `product_id`  | INT  | PRIMARY KEY, FK → PRODUCTS   | Product reference  |
| `category_id` | INT  | PRIMARY KEY, FK → CATEGORIES | Category reference |

**Composite Primary Key:** (product_id, category_id)

**Sample Data:**

```sql
INSERT INTO PRODUCT_CATEGORIES (product_id, category_id)
VALUES (1, 1), (1, 2);  -- Product 1 in Electronics and Computers
```

---

### 7. ORDERS (Operations - Core)

**Description:** Customer orders and delivery information

| Column             | Type          | Constraints                 | Description               |
| ------------------ | ------------- | --------------------------- | ------------------------- |
| `order_id`         | INT           | PRIMARY KEY, AUTO_INCREMENT | Order identifier          |
| `customer_id`      | INT           | NOT NULL, FK → USERS        | Customer who placed order |
| `driver_id`        | INT           | NULL, FK → USERS            | Assigned delivery driver  |
| `status`           | ENUM          | NOT NULL, DEFAULT 'pending' | Current order state       |
| `delivery_address` | VARCHAR(255)  | NULL                        | Delivery destination      |
| `notes`            | TEXT          | NULL                        | Special instructions      |
| `ordered_at`       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP   | Order creation time       |
| `order_finished`   | TIMESTAMP     | NULL                        | Delivery completion time  |
| `total_price`      | DECIMAL(10,2) | DEFAULT 0.00                | Order total (EUR)         |

**Indexes:**

- `idx_orders_driver_status` - For driver delivery queries
- `idx_orders_customer` - For customer order lookup

**Valid Status Values:** pending, assigned, in_progress, ready_for_pickup, in_transit, done, stuck, cancelled

**Sample Data:**

```sql
INSERT INTO ORDERS (customer_id, delivery_address, notes, total_price)
VALUES (1, '123 Main St, Helsinki 00100', 'Ring doorbell', 129.97);
```

---

### 8. ORDER_ITEMS (Order Details)

**Description:** Individual items within an order

| Column          | Type          | Constraints                 | Description                  |
| --------------- | ------------- | --------------------------- | ---------------------------- |
| `order_item_id` | INT           | PRIMARY KEY, AUTO_INCREMENT | Line item identifier         |
| `order_id`      | INT           | NOT NULL, FK → ORDERS       | Associated order             |
| `product_id`    | INT           | NOT NULL, FK → PRODUCTS     | Product ordered              |
| `quantity`      | INT           | NOT NULL                    | Units ordered                |
| `unit_price`    | DECIMAL(10,2) | NOT NULL                    | Price per unit at order time |

**Indexes:**

- `idx_order_items_order` - For fetching order details
- `idx_order_items_product` - For product usage analytics

**Sample Data:**

```sql
INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price)
VALUES (10, 1, 2, 29.99);
```

---

### 9. DELIVERY_TRACKING (Real-time Tracking)

**Description:** GPS location history during delivery

| Column        | Type          | Constraints                 | Description            |
| ------------- | ------------- | --------------------------- | ---------------------- |
| `tracking_id` | INT           | PRIMARY KEY, AUTO_INCREMENT | Track point identifier |
| `order_id`    | INT           | NOT NULL, FK → ORDERS       | Associated delivery    |
| `latitude`    | DECIMAL(10,6) | NULL                        | GPS latitude (WGS84)   |
| `longitude`   | DECIMAL(10,6) | NULL                        | GPS longitude (WGS84)  |
| `updated_at`  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP   | Location timestamp     |

**Indexes:**

- `idx_tracking_order` - For location lookup

**Sample Data:**

```sql
INSERT INTO DELIVERY_TRACKING (order_id, latitude, longitude)
VALUES (10, 60.1699, 24.9384);
```

---

### 10. ANNOUNCEMENTS (Communications)

**Description:** System-wide announcements and notices

| Column            | Type         | Constraints                 | Description                       |
| ----------------- | ------------ | --------------------------- | --------------------------------- |
| `announcement_id` | INT          | PRIMARY KEY, AUTO_INCREMENT | Announcement identifier           |
| `title`           | VARCHAR(255) | NOT NULL                    | Announcement headline             |
| `content`         | TEXT         | NULL                        | Full announcement content         |
| `created_at`      | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP   | Publication date                  |
| `expires_at`      | TIMESTAMP    | NULL                        | Expiration date (auto-hide after) |

---

### 11. NOTIFICATIONS (User Notifications)

**Description:** Individual user notifications

| Column            | Type         | Constraints                 | Description                                       |
| ----------------- | ------------ | --------------------------- | ------------------------------------------------- |
| `notification_id` | INT          | PRIMARY KEY, AUTO_INCREMENT | Notification identifier                           |
| `user_id`         | INT          | NOT NULL, FK → USERS        | Recipient user                                    |
| `title`           | VARCHAR(255) | NOT NULL                    | Notification title                                |
| `message`         | TEXT         | NOT NULL                    | Notification content                              |
| `type`            | ENUM         | DEFAULT 'info'              | Notification type (info, success, warning, error) |
| `created_at`      | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP   | Creation time                                     |
| `read_at`         | TIMESTAMP    | NULL                        | When user read notification                       |

**Indexes:**

- `idx_notifications_user` - For user notification lookup
- `idx_notifications_read` - For unread notification queries

---

## Field Descriptions

### Status Fields

**ORDER Status:**

```
pending          → Initial state, awaiting processing
assigned         → Driver has been assigned
in_progress      → Order is being prepared
ready_for_pickup → Ready for driver to collect
in_transit       → Driver has picked up and is delivering
done             → Successfully delivered
stuck            → Delivery issue, awaiting resolution
cancelled        → Order cancelled by customer/admin
```

**CUSTOMER_PROFILES Status:**

```
pending  → Profile under review
active   → Profile is active and can place orders
inactive → Profile suspended
```

### ENUM Definitions

**Role ENUM:**

```sql
ENUM('customer', 'driver', 'admin')
```

**Tier ENUM (Customer):**

```sql
ENUM('starter', 'pro', 'enterprise')
```

**Notification Type ENUM:**

```sql
ENUM('info', 'success', 'warning', 'error')
```

---

## Indexes

### Performance Indexes

| Table             | Index                    | Columns             | Purpose                  |
| ----------------- | ------------------------ | ------------------- | ------------------------ |
| USERS             | PRIMARY                  | user_id             | Primary lookup           |
| USERS             | idx_user_role            | role                | Role-based filtering     |
| DRIVER_PROFILES   | idx_driver_active        | active              | Available driver queries |
| PRODUCTS          | idx_products_stock       | stock_quantity      | Inventory alerts         |
| ORDERS            | idx_orders_driver_status | (driver_id, status) | Driver workload          |
| ORDERS            | idx_orders_customer      | customer_id         | Customer order history   |
| ORDER_ITEMS       | idx_order_items_order    | order_id            | Order details fetch      |
| ORDER_ITEMS       | idx_order_items_product  | product_id          | Product analytics        |
| DELIVERY_TRACKING | idx_tracking_order       | order_id            | Location lookup          |
| NOTIFICATIONS     | idx_notifications_user   | user_id             | User notifications       |
| NOTIFICATIONS     | idx_notifications_read   | read_at             | Unread count             |

---

## Foreign Keys

### Referential Integrity

| Table              | Column      | References             | Delete Policy |
| ------------------ | ----------- | ---------------------- | ------------- |
| CUSTOMER_PROFILES  | user_id     | USERS.user_id          | CASCADE       |
| DRIVER_PROFILES    | user_id     | USERS.user_id          | CASCADE       |
| PRODUCT_CATEGORIES | product_id  | PRODUCTS.product_id    | CASCADE       |
| PRODUCT_CATEGORIES | category_id | CATEGORIES.category_id | CASCADE       |
| ORDERS             | customer_id | USERS.user_id          | CASCADE       |
| ORDERS             | driver_id   | USERS.user_id          | SET NULL      |
| ORDER_ITEMS        | order_id    | ORDERS.order_id        | CASCADE       |
| ORDER_ITEMS        | product_id  | PRODUCTS.product_id    | CASCADE       |
| DELIVERY_TRACKING  | order_id    | ORDERS.order_id        | CASCADE       |
| NOTIFICATIONS      | user_id     | USERS.user_id          | CASCADE       |

---

## Common Queries

### Get Customer Order History

```sql
SELECT
  o.order_id,
  o.status,
  o.total_price,
  o.ordered_at,
  COUNT(oi.order_item_id) as items_count
FROM ORDERS o
LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
WHERE o.customer_id = 1
GROUP BY o.order_id
ORDER BY o.ordered_at DESC;
```

### Get Driver Workload

```sql
SELECT
  u.full_name,
  dp.current_orders,
  dp.max_orders,
  COUNT(o.order_id) as active_deliveries
FROM DRIVER_PROFILES dp
JOIN USERS u ON dp.user_id = u.user_id
LEFT JOIN ORDERS o ON o.driver_id = u.user_id
  AND o.status NOT IN ('done', 'cancelled')
WHERE dp.active = TRUE
GROUP BY dp.driver_id;
```

### Get Revenue by Period

```sql
SELECT
  DATE(o.ordered_at) as date,
  COUNT(*) as order_count,
  SUM(o.total_price) as daily_revenue,
  AVG(o.total_price) as avg_order
FROM ORDERS o
WHERE o.status = 'done'
  AND o.ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(o.ordered_at)
ORDER BY date DESC;
```

### Get Low Stock Products

```sql
SELECT
  p.product_id,
  p.name,
  p.stock_quantity,
  p.low_stock_threshold,
  COUNT(oi.order_item_id) as recent_orders
FROM PRODUCTS p
LEFT JOIN ORDER_ITEMS oi ON p.product_id = oi.product_id
WHERE p.stock_quantity <= p.low_stock_threshold
GROUP BY p.product_id;
```

---

## Data Integrity Constraints

### Unique Constraints

- USERS.email - No duplicate emails
- CUSTOMER_PROFILES.user_id - One profile per user
- DRIVER_PROFILES.user_id - One profile per user
- CATEGORIES.name - No duplicate category names
- PRODUCT_CATEGORIES - No duplicate product-category mappings

### NOT NULL Constraints

- All `_id` fields
- USERS.full_name, email, password_hash, role
- PRODUCTS.name, base_price
- ORDERS.customer_id
- ORDER_ITEMS.order_id, product_id, quantity, unit_price
- NOTIFICATIONS.user_id, title, message

---

## Connection String Example

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## Backup & Maintenance

### Recommended Backups

- Daily differential backups
- Weekly full backups
- Monthly archived backups

### Maintenance Tasks

- Index optimization: monthly
- Constraint verification: quarterly
- Archive old notifications: quarterly
- Update table statistics: monthly

---

**Last Updated:** May 4, 2026  
**Database Version:** MySQL 8.0+  
**Schema Version:** 1.0
