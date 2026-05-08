-- ================================================
-- DATABASE SCHEMA CREATION FOR DELIVERY SYSTEM (UPDATED)
-- ================================================

-- 1. users table (Identity Layer)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL, -- LISÄTTY: Nimi tarvitaan frontendin taulukoihin
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'driver', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_user_role (role)
);

-- 2. customer_profiles table (Business Layer)
CREATE TABLE IF NOT EXISTS customer_profiles (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(255),
    address VARCHAR(255),
    tel VARCHAR(50),
    vat_number VARCHAR(50),
    tier ENUM('starter', 'pro', 'enterprise') DEFAULT 'starter',
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. driver_profiles table (Business Layer)
CREATE TABLE IF NOT EXISTS driver_profiles (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    vehicle_info VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    current_orders INT DEFAULT 0,
    max_orders INT DEFAULT 5,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_driver_active (active)
);

-- 4. categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 5. products table (Operations Layer)
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT, -- LISÄTTY: Tuotekuvaus
    base_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    product_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- POISTETTU: product_exp DATE,
    -- POISTETTU: category_id INT (Siirretty alempaan tauluun)
    INDEX idx_products_stock (stock_quantity) -- KORJATTU: Ylimääräinen puolipiste poistettu
);

-- 5.1 PRODUCT_categories (UUSI TAULU)
-- Mahdollistaa usean kategorian valitsemisen yhdelle tuotteelle
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- 6. orders table (Operations Layer)
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    driver_id INT DEFAULT NULL,
    status ENUM('pending','assigned','in_progress','ready_for_pickup','in_transit','done','stuck', 'cancelled') DEFAULT 'pending',
    delivery_address VARCHAR(255),
    notes TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_finished TIMESTAMP NULL,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    latitude DECIMAL(10,8) DEFAULT NULL,
    longitude DECIMAL(10,8) DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_orders_driver_status (driver_id, status),
    INDEX idx_orders_customer (customer_id)
);

-- 7. order_items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

-- 8. delivery_tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    latitude DECIMAL(10,6) DEFAULT NULL,
    longitude DECIMAL(10,6) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_tracking_order (order_id)
);

-- 9. announcements table
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

-- 10. notifications table (User Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (read_at)
);
