# MySQL Workbench Setup for VPMS

## Prerequisites
1. Install MySQL Server (8.0 or later)
2. Install MySQL Workbench
3. Start MySQL service

## Setup Steps

### 1. Configure MySQL Connection
1. Open MySQL Workbench
2. Create a new connection:
   - Connection Name: `VPMS_Local`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: [your MySQL root password]

### 2. Update Backend Configuration
Update the `.env` file in the backend folder:
```
DB_PASSWORD=Root@1234
```

### 3. Create Database and Tables
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run the following SQL commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS vpms_db;
USE vpms_db;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Resident', 'Security Guard', 'Admin') NOT NULL,
  contact_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Visitors_Parcels table
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
```

### 4. Insert Default Users
Run the SQL script from `database/insert_users.sql` in MySQL Workbench.

### 5. Test Connection
Start the backend server and check for "Database connected successfully" message.

## Login Credentials
- Admin: `admin@vpms.com` / `password123`
- Security Guard: `guard@vpms.com` / `password123`
- Resident: `resident@vpms.com` / `password123`
- Resident 2: `jane@vpms.com` / `password123`

## Troubleshooting
- Ensure MySQL service is running
- Check firewall settings for port 3306
- Verify credentials in .env file
- Check MySQL error logs if connection fails