
-- ==================================================
-- CREATE TEST USERS
-- ==================================================
INSERT INTO USERS (email, password_hash, role)
VALUES 
('testcustomer@example.com', '$2b$10$sUW6ShAGqR6qEwte5hkEK.CgYYf08V.lCny/rB.GljX2yD0YqV.lS', 'customer'), -- Password hash: password123
('testdriver@example.com', '$2b$10$kiocoRzVT.05vwlklN.pdOMH5q5VGsV7r.49AV4gTCwCV9wFkfNSm', 'driver'), -- Password hash: driver123
('admin@example.com', '$2b$10$w3kjnQNjqzhqQv8kxFjCi.K.qOfoNmq.8MQ6zCJFxgX.fW.yIu/4q', 'admin'); -- Password hash: admin123