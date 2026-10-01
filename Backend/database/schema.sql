-- Univent MySQL Schema (run: mysql -u root -p univent < schema.sql)
CREATE DATABASE IF NOT EXISTS univent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE univent;

CREATE TABLE divisions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT, short_description VARCHAR(500),
  logo VARCHAR(500), banner_image VARCHAR(500),
  icon VARCHAR(50), color VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE, sort_order INT DEFAULT 0,
  admin_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin','division_admin','customer','staff') DEFAULT 'customer',
  division_id CHAR(36) NULL,
  avatar VARCHAR(500), is_active BOOLEAN DEFAULT TRUE,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
);

CREATE TABLE categories (
  id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
  description TEXT, image VARCHAR(500),
  division_id CHAR(36) NOT NULL, is_active BOOLEAN DEFAULT TRUE, sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
);

CREATE TABLE products (
  id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT, short_description VARCHAR(500),
  price DECIMAL(12,2) NOT NULL, original_price DECIMAL(12,2) NULL,
  images JSON, category_id CHAR(36) NOT NULL, division_id CHAR(36) NOT NULL,
  sku VARCHAR(100) UNIQUE, stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE, is_featured BOOLEAN DEFAULT FALSE,
  tags JSON, specifications JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE rooms (
  id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT, short_description VARCHAR(500),
  price DECIMAL(12,2) NOT NULL, original_price DECIMAL(12,2) NULL,
  images JSON, category_id CHAR(36) NOT NULL, division_id CHAR(36) NOT NULL,
  capacity INT DEFAULT 2, bed_type VARCHAR(100), bed_size VARCHAR(50),
  amenities JSON, features JSON,
  is_active BOOLEAN DEFAULT TRUE, is_featured BOOLEAN DEFAULT FALSE,
  total_rooms INT DEFAULT 1, available_rooms INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE facilities (
  id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
  description TEXT, short_description VARCHAR(500), images JSON,
  division_id CHAR(36) NOT NULL, icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE, requires_booking BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id CHAR(36) PRIMARY KEY, user_id CHAR(36) NOT NULL, room_id CHAR(36) NOT NULL, division_id CHAR(36) NOT NULL,
  check_in DATE NOT NULL, check_out DATE NOT NULL,
  guests INT DEFAULT 2, adults INT DEFAULT 2, children INT DEFAULT 0,
  total_nights INT, price_per_night DECIMAL(12,2), subtotal DECIMAL(12,2), tax DECIMAL(12,2), total DECIMAL(12,2),
  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show') DEFAULT 'pending',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (room_id) REFERENCES rooms(id), FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY, user_id CHAR(36) NOT NULL, division_id CHAR(36) NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','completed','cancelled','refunded') DEFAULT 'pending',
  subtotal DECIMAL(12,2), tax DECIMAL(12,2), shipping DECIMAL(12,2) DEFAULT 0, discount DECIMAL(12,2) DEFAULT 0, total DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'NGN',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  payment_method VARCHAR(50), payment_reference VARCHAR(255),
  shipping_address JSON, billing_address JSON, notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE order_items (
  id CHAR(36) PRIMARY KEY, order_id CHAR(36) NOT NULL,
  type ENUM('product','room','facility') NOT NULL,
  product_id CHAR(36) NULL, room_id CHAR(36) NULL, facility_id CHAR(36) NULL,
  quantity INT, price DECIMAL(12,2), name VARCHAR(255), image VARCHAR(500), metadata JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Seed divisions
INSERT INTO divisions (id, name, slug, short_description, icon) VALUES
(UUID(), 'U.I. Bakery / U & I Fast Food', 'bakery-fastfood', 'Bromate-free bread & fast food', '🍞'),
(UUID(), 'U.I. Petrol Station', 'petrol-station', 'Fuel & auto care', '⛽'),
(UUID(), 'U.I. Printing Press', 'printing-press', 'Printing & branding', '🖨️'),
(UUID(), 'U.I. Health, Safety and Environment Unit', 'health-safety', 'HSE & fumigation', '🏥'),
(UUID(), 'U.I. Consultancy Services Unit', 'consultancy', 'Research consultancy', '💼'),
(UUID(), 'U.I. Hotels', 'hotels', 'Rooms & facilities', '🏨');

-- Seed super admin (password: password)
INSERT INTO users (id, first_name, last_name, email, password, role)
VALUES (UUID(), 'Super', 'Admin', 'admin@univent.ui.edu.ng', '$2y$12$Lr5Z5Z5Z5Z5Z5Z5Z5Z5Z5u5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z2', 'super_admin');

-- Transfer-receipt flow + daily sales (added after launch of receipt confirmation)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'transfer',
  ADD COLUMN IF NOT EXISTS room_number VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS receipt TEXT NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment ENUM('pickup','delivery') DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS receipt TEXT NULL;

CREATE TABLE IF NOT EXISTS daily_sales (
  id CHAR(36) PRIMARY KEY,
  division_id CHAR(36) NULL,
  division_name VARCHAR(255),
  date DATE NOT NULL,
  item TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  entered_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
);
