-- ==================================================
-- 1. CREATE TEST 
 (Korjattu: full_name lisätty)
-- ==================================================
INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Asiakas Oy (Testi)', 'testcustomer@example.com', '$2b$10$sUW6ShAGqR6qEwte5hkEK.CgYYf08V.lCny/rB.GljX2yD0YqV.lS', 'customer'), -- pw: password123
('Jari Kuljettaja', 'testdriver@example.com', '$2b$10$kiocoRzVT.05vwlklN.pdOMH5q5VGsV7r.49AV4gTCwCV9wFkfNSm', 'driver'), -- pw: driver123
('Admin Pääkäyttäjä', 'admin@example.com', '$2b$10$w3kjnQNjqzhqQv8kxFjCi.K.qOfoNmq.8MQ6zCJFxgX.fW.yIu/4q', 'admin'); -- pw: admin123

-- ==================================================
-- 2. CREATE TEST PROFILES
-- ==================================================
INSERT INTO customer_profiles (user_id, company_name, address, tel, tier, status)
VALUES
(1, 'Testi Yritys Oy', 'Testikatu 1, 00100 Helsinki', '0401234567', 'pro', 'active');

INSERT INTO driver_profiles (user_id, vehicle_info, active, current_orders)
VALUES
(2, 'Mercedes Sprinter (XYZ-123)', TRUE, 2);

-- ==================================================
-- 3. CREATE categories & products (Uusi: Riippuvuudet kuntoon)
-- ==================================================
INSERT INTO categories (name) VALUES 
('Rakennustarvikkeet'), 
('Toimistotarvikkeet'), 
('Elektroniikka');

INSERT INTO products (name, description, base_price, stock_quantity) VALUES
('Ammattitason Iskuporakone', 'Tehokas porakone 18V akulla ja pikalaturilla.', 199.90, 45),
('Kopiopaperi A4, 500 kpl', 'Korkealaatuinen valkoinen tulostinpaperi.', 5.50, 300),
('Ergonominen Työtuoli', 'Säädettävä ristiseläntuki ja käsinojat.', 249.00, 12),
('27" 4K Näyttö', 'Tarkka näyttö graafiseen työhön.', 350.00, 8);

-- Liitetään tuotteet kategorioihin
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), -- Porakone -> Rakennus
(2, 2), -- Paperi -> Toimisto
(3, 2), -- Tuoli -> Toimisto
(4, 3); -- Näyttö -> Elektroniikka

-- ==================================================
-- 4. CREATE TEST orders (Uusi: Laajennettu data karttoja varten)
-- ==================================================
INSERT INTO orders (customer_id, driver_id, status, delivery_address, total_price, ordered_at, latitude, longitude)
VALUES
-- 1. Keräilyssä (Varastolla)
(1, 2, 'in_progress', 'Hämeentie 3, 00530 Helsinki', 205.40, NOW() - INTERVAL 1 DAY, 60.186, 24.961),
-- 2. Odottaa kuskia (Ei vielä kuskia)
(1, NULL, 'pending', 'Mannerheimintie 10, 00100 Helsinki', 350.00, NOW() - INTERVAL 2 HOUR, 60.169, 24.938),
-- 3. Matkalla (Live-seuranta käynnissä!)
(1, 2, 'in_transit', 'Itäväylä 1, 00500 Helsinki', 448.90, NOW() - INTERVAL 4 HOUR, 60.188, 24.965),
-- 4. Odottaa noutoa (Kuski nimetty, mutta ei hakenut vielä)
(1, 2, 'ready_for_pickup', 'Teollisuuskatu 10, 00510 Helsinki', 5.50, NOW() - INTERVAL 1 HOUR, 60.191, 24.946),
-- 5. Toimitettu (Menneisyydessä)
(1, 2, 'done', 'Aleksanterinkatu 5, 00100 Helsinki', 249.00, NOW() - INTERVAL 3 DAY, 60.168, 24.941);

-- ==================================================
-- 5. CREATE ORDER ITEMS
-- ==================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 1, 199.90), (1, 2, 1, 5.50),     -- Tilaus 1
(2, 4, 1, 350.00),                      -- Tilaus 2
(3, 1, 1, 199.90), (3, 3, 1, 249.00),   -- Tilaus 3
(4, 2, 1, 5.50),                        -- Tilaus 4
(5, 3, 1, 249.00);                      -- Tilaus 5

-- ==================================================
-- 6. CREATE DELIVERY TRACKING (Uusi: Syöttö Live-kartalle)
-- ==================================================
-- Luodaan kuskille sijainti tilausta 3 varten (joka on in_transit)
INSERT INTO delivery_tracking (order_id, latitude, longitude)
VALUES
(3, 60.195123, 24.950456);

-- ==================================================
-- 7. CREATE announcements & notifications
-- ==================================================
INSERT INTO announcements (title, content, expires_at)
VALUES
('Järjestelmäpäivitys tulossa', 'Huoltokatko lauantaina klo 02:00-04:00. Karttatoiminnoissa voi olla katkoksia.', NOW() + INTERVAL 7 DAY),
('Uusia ominaisuuksia', 'Live-kartta on nyt käytössä kaikille asiakkaille! Voit seurata toimitusta reaaliajassa.', NOW() + INTERVAL 30 DAY);

INSERT INTO notifications (user_id, title, message, type)
VALUES
(1, 'Tilaus matkalla', 'Tilauksesi #3 on noudettu ja on nyt matkalla!', 'success'),
(2, 'Uusi keikka', 'Sinulle on osoitettu uusi nouto varastolta (Tilaus #4).', 'info');