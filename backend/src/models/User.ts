import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'Resident' | 'Security Guard' | 'Admin';
  contact_info?: string;
  created_at: Date;
}

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'created_at'>): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.role, userData.contact_info || null]
      );
      
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }
  
  static async findById(id: number): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }
  
  static async findByRole(role: string): Promise<User[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, name, email, role, contact_info, created_at FROM users WHERE role = ?', 
        [role]
      );
      return rows as User[];
    } finally {
      connection.release();
    }
  }
  
  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  static generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'vpms_secret_key_2024';
    
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    );
  }
}