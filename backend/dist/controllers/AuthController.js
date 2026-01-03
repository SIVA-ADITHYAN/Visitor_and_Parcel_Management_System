"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
class AuthController {
    static async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }
            const { name, email, password, role, contact_info } = req.body;
            const existingUser = await User_1.UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }
            const userId = await User_1.UserModel.create({ name, email, password, role, contact_info });
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(500).json({ message: 'Failed to create user' });
            }
            const token = User_1.UserModel.generateToken(user);
            return res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }
            const { email, password } = req.body;
            const user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const isValidPassword = await User_1.UserModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = User_1.UserModel.generateToken(user);
            return res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getResidents(req, res) {
        try {
            const residents = await User_1.UserModel.findByRole('Resident');
            return res.json({ residents });
        }
        catch (error) {
            console.error('Get residents error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
AuthController.validateRegister = [
    (0, express_validator_1.body)('name').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
    (0, express_validator_1.body)('role').isIn(['Resident', 'Security Guard', 'Admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('contact_info').optional().trim().isLength({ max: 20 }).withMessage('Contact info max 20 characters')
];
AuthController.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
