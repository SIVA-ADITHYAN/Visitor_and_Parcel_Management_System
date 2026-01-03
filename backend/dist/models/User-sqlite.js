"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_sqlite_1 = require("../config/database-sqlite");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserModel {
    static async create(user) {
        const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
        const result = await (0, database_sqlite_1.execute)('INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)', [user.name, user.email, hashedPassword, user.role, user.contact_info]);
        return result.insertId;
    }
    static async findByEmail(email) {
        const user = await (0, database_sqlite_1.getOne)('SELECT * FROM users WHERE email = ?', [email]);
        return user || null;
    }
    static async findById(id) {
        const user = await (0, database_sqlite_1.getOne)('SELECT * FROM users WHERE id = ?', [id]);
        return user || null;
    }
    static async findByRole(role) {
        const users = await (0, database_sqlite_1.query)('SELECT id, name, email, role, contact_info FROM users WHERE role = ?', [role]);
        return users;
    }
    static async validatePassword(plainPassword, hashedPassword) {
        return bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    static generateToken(user) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
    }
}
exports.UserModel = UserModel;
