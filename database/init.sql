-- VPMS Database Setup Script
-- Run this script to set up the database manually if needed

CREATE DATABASE IF NOT EXISTS vpms_db;
USE vpms_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Resident', 'Security Guard', 'Admin') NOT NULL,
  contact_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitors and Parcels table
CREATE TABLE IF NOT EXISTS visitors_parcels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT NOT NULL,
  security_guard_id INT NOT NULL,
  type ENUM('Visitor', 'Parcel') NOT NULL,
  name VARCHAR(255) NOT NULL,
  purpose_description TEXT NOT NULL,
  media VARCHAR(500),
  vehicle_details VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES users(id),
  FOREIGN KEY (security_guard_id) REFERENCES users(id)
);

-- No default data - users must register through the application

COMMIT;