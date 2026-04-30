
-- ==================================================
-- CREATE TEST USERS
-- ==================================================
INSERT INTO USERS (email, password_hash, role)
VALUES
('testcustomer@example.com', '$2b$10$sUW6ShAGqR6qEwte5hkEK.CgYYf08V.lCny/rB.GljX2yD0YqV.lS', 'customer'), -- Password hash: password123
('testdriver@example.com', '$2b$10$kiocoRzVT.05vwlklN.pdOMH5q5VGsV7r.49AV4gTCwCV9wFkfNSm', 'driver'), -- Password hash: driver123
('admin@example.com', '$2b$10$w3kjnQNjqzhqQv8kxFjCi.K.qOfoNmq.8MQ6zCJFxgX.fW.yIu/4q', 'admin'); -- Password hash: admin123

-- ==================================================
-- CREATE TEST PROFILES
-- ==================================================
-- Huom: Oletetaan että user_id:t ovat 1 (customer), 2 (driver), 3 (admin)
INSERT INTO CUSTOMER_PROFILES (user_id, company_name, address, tel)
VALUES
(1, 'Testi Yritys Oy', 'Testikatu 1, 00100 Helsinki', '0401234567');

INSERT INTO DRIVER_PROFILES (user_id, vehicle_info, active)
VALUES
(2, 'Pakettiauto (XYZ-123)', TRUE);

-- ==================================================
-- CREATE TEST ORDERS & ITEMS
-- ==================================================
INSERT INTO ORDERS (customer_id, driver_id, status, delivery_address, total_price, ordered_at, latitude, longitude)
VALUES
(1, 2, 'in_progress', 'Hämeentie 3, 00530 Helsinki', 450.25, NOW() - INTERVAL 1 DAY, 60.186, 24.961),
(1, NULL, 'pending', 'Mannerheimintie 10, 00100 Helsinki', 120.00, NOW() - INTERVAL 2 HOUR, 60.169, 24.938);

-- Tuotteet ensimmäiseen tilaukseen (order_id = 1)
INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 10, 45.025);

-- Tuotteet toiseen tilaukseen (order_id = 2)
INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price)
VALUES
(2, 2, 5, 24.00);
