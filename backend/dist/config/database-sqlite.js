"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.execute = exports.query = exports.initializeDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../vpms.db');
const db = new sqlite3_1.default.Database(dbPath);
const run = (0, util_1.promisify)(db.run.bind(db));
const get = (0, util_1.promisify)(db.get.bind(db));
const all = (0, util_1.promisify)(db.all.bind(db));
const initializeDatabase = async () => {
    try {
        // Create Users table
        await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('Resident', 'Security Guard', 'Admin')),
        contact_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create Visitors_Parcels table
        await run(`
      CREATE TABLE IF NOT EXISTS visitors_parcels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resident_id INTEGER NOT NULL,
        security_guard_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Visitor', 'Parcel')),
        name TEXT NOT NULL,
        purpose_description TEXT NOT NULL,
        media TEXT,
        vehicle_details TEXT,
        status TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resident_id) REFERENCES users(id),
        FOREIGN KEY (security_guard_id) REFERENCES users(id)
      )
    `);
        console.log('SQLite database initialized successfully');
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const query = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.query = query;
const execute = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
    });
};
exports.execute = execute;
const getOne = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
exports.getOne = getOne;
