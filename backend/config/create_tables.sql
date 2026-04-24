-- ================================================
-- DATABASE SCHEMA CREATION FOR DELIVERY SYSTEM
-- ================================================


-- 1. USERS table (Identity Layer)
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'driver', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    INDEX idx_user_role (role)
);

-- 2. CUSTOMER_PROFILES table (Business Layer)
CREATE TABLE IF NOT EXISTS CUSTOMER_PROFILES (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(255),
    address VARCHAR(255),
    tel VARCHAR(50),
    vat_number VARCHAR(50),
    tier ENUM('basic', 'silver', 'gold') DEFAULT 'basic',
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- 3. DRIVER_PROFILES table (Business Layer)
CREATE TABLE IF NOT EXISTS DRIVER_PROFILES (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    vehicle_info VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
    INDEX idx_driver_active (active)
);

-- 4. PRODUCTS table (Operations Layer)
CREATE TABLE IF NOT EXISTS PRODUCTS (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5
);

-- 5. ORDERS table (Operations Layer)
CREATE TABLE IF NOT EXISTS ORDERS (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    driver_id INT DEFAULT NULL,
    status ENUM('pending','assigned','in_progress','in_transit','done','stuck') DEFAULT 'pending',
    delivery_address VARCHAR(255),
    notes TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_delivery TIMESTAMP NULL,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (customer_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES USERS(user_id) ON DELETE SET NULL

    INDEX idx_orders_driver_status (driver_id, status),
    INDEX idx_orders_customer (customer_id)
);

-- 6. ORDER_ITEMS table
CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCTS(product_id) ON DELETE CASCADE

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

-- 7. DELIVERY_TRACKING table
CREATE TABLE IF NOT EXISTS DELIVERY_TRACKING (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status ENUM('pending','assigned','in_progress','in_transit','done','stuck') DEFAULT 'pending',
    latitude DECIMAL(10,6) DEFAULT NULL,
    longitude DECIMAL(10,6) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE
    INDEX idx_tracking_order (order_id)
);

-- 8. ANNOUNCEMENTS table
CREATE TABLE IF NOT EXISTS ANNOUNCEMENTS (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);