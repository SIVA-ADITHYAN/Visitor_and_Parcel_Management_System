"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
class UserModel {
    static async create(userData) {
        const connection = await database_1.pool.getConnection();
        try {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
            const [result] = await connection.execute('INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)', [userData.name, userData.email, hashedPassword, userData.role, userData.contact_info || null]);
            return result.insertId;
        }
        finally {
            connection.release();
        }
    }
    static async findById(id) {
        const connection = await database_1.pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
            const users = rows;
            return users.length > 0 ? users[0] : null;
        }
        finally {
            connection.release();
        }
    }
    static async findByEmail(email) {
        const connection = await database_1.pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
            const users = rows;
            return users.length > 0 ? users[0] : null;
        }
        finally {
            connection.release();
        }
    }
    static async findByRole(role) {
        const connection = await database_1.pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT id, name, email, role, contact_info, created_at FROM users WHERE role = ?', [role]);
            return rows;
        }
        finally {
            connection.release();
        }
    }
    static async validatePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    static generateToken(user) {
        const secret = process.env.JWT_SECRET || 'vpms_secret_key_2024';
        return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
    }
}
exports.UserModel = UserModel;
