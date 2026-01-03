"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const database_1 = require("../config/database");
class HealthController {
    static async check(req, res) {
        try {
            const connection = await (0, database_1.createConnection)();
            await connection.execute('SELECT 1');
            await connection.end();
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected',
                version: '1.0.0'
            });
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: 'Database connection failed'
            });
        }
    }
}
exports.HealthController = HealthController;
