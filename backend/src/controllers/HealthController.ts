import { Request, Response } from 'express';
import { createConnection } from '../config/database';

export class HealthController {
  static async check(req: Request, res: Response) {
    try {
      const connection = await createConnection();
      await connection.execute('SELECT 1');
      await connection.end();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed'
      });
    }
  }
}