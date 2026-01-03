import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';

export class AuthController {
  static validateRegister = [
    body('name').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
    body('role').isIn(['Resident', 'Security Guard', 'Admin']).withMessage('Invalid role'),
    body('contact_info').optional().trim().isLength({ max: 20 }).withMessage('Contact info max 20 characters')
  ];
  
  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ];
  
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      
      const { name, email, password, role, contact_info } = req.body;
      
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      const userId = await UserModel.create({ name, email, password, role, contact_info });
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(500).json({ message: 'Failed to create user' });
      }
      
      const token = UserModel.generateToken(user);
      
      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      
      const { email, password } = req.body;
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await UserModel.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = UserModel.generateToken(user);
      
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async getResidents(req: Request, res: Response): Promise<Response> {
    try {
      const residents = await UserModel.findByRole('Resident');
      return res.json({ residents });
    } catch (error) {
      console.error('Get residents error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}