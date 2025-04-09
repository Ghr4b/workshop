USE vulnerable_store;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) NOT NULL PRIMARY KEY,
    expires BIGINT NOT NULL,
    data TEXT,
    INDEX expires_idx (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2),
    description TEXT,
    preRelease BOOLEAN DEFAULT false
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255)
);

-- Insert users (FIXED: Correct column count)
INSERT INTO users (username, password) VALUES
('admin', 'iHateToBeAPassword'),
('test', 'test_pass123');

-- Insert items (FIXED: Added preRelease value for all)
INSERT INTO items (id, name, price, description, preRelease) VALUES
(1, 'MacBook Pro', 1999.99, '16-inch, M3 Pro chip', false),
(2, 'iPhone 15 Pro', 999.99, 'Titanium, 6.1-inch display', false),
(3, 'AirPods Pro', 249.99, 'Active noise cancellation', false),
(4, 'iPad Air', 599.99, 'M1 chip, 10.9-inch', false),
(5, 'Apple Watch Ultra', 799.99, 'Titanium case, GPS + Cellular', false),
(6, 'iMac 24-inch', 1299.99, 'M3 chip, 4.5K display', false),
(7, 'Mac Mini', 599.99, 'M2 chip, 8-core CPU', false),
(8, 'Apple TV 4K', 129.99, '64GB storage', false),
(9, 'HomePod mini', 99.99, 'Space Gray', false),
(10, 'Magic Keyboard', 149.99, 'With Touch ID', false),
(99, 'Pre-release item', 999.99, 'This item is not yet released', true);

-- reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(255),
    rating INT ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    product_id INT PRIMARY KEY,
    units INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES items(id)
);

-- Insert inventory data
INSERT INTO inventory (product_id, units) VALUES
(1, 10), (2, 5), (3, 20), (4, 8), (5, 3),
(6, 15), (7, 7), (8, 12), (9, 25), (10, 30),
(99, 2);