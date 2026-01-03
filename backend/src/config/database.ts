import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vpms_db',
};

// Connection pool for better scalability
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export { pool };

export const initializeDatabase = async () => {
  try {
    // First connect without database to create it
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // Create database if not exists
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConnection.end();
    
    // Now connect to the specific database
    const connection = await mysql.createConnection(dbConfig);
    
    // Create Users table with indexes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('Resident', 'Security Guard', 'Admin') NOT NULL,
        contact_info VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    
    // Create Visitors_Parcels table with indexes
    await connection.execute(`
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
        FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (security_guard_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_resident (resident_id),
        INDEX idx_security_guard (security_guard_id),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('Database tables initialized');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('\n=== SETUP INSTRUCTIONS ===');
    console.log('1. Install MySQL Server');
    console.log('2. Start MySQL service');
    console.log('3. Update .env file with correct database credentials');
    console.log('4. Create users via registration endpoint');
    console.log('========================\n');
    throw error;
  }
};