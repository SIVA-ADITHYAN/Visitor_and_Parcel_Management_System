"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const database_1 = require("../config/database");
class AdminController {
    static async getDashboardStats(req, res) {
        try {
            const connection = await (0, database_1.createConnection)();
            // Get comprehensive stats
            const [visitorStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_visitors,
          SUM(CASE WHEN status IN ('New', 'Waiting for Approval') THEN 1 ELSE 0 END) as pending_visitors,
          SUM(CASE WHEN status IN ('Approved', 'Entered') THEN 1 ELSE 0 END) as active_visitors,
          SUM(CASE WHEN status = 'Exited' THEN 1 ELSE 0 END) as completed_visitors,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_visitors
        FROM visitors_parcels WHERE type = 'Visitor'
      `);
            const [parcelStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_parcels,
          SUM(CASE WHEN status = 'Received' THEN 1 ELSE 0 END) as pending_parcels,
          SUM(CASE WHEN status = 'Acknowledged' THEN 1 ELSE 0 END) as acknowledged_parcels,
          SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected_parcels,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_parcels
        FROM visitors_parcels WHERE type = 'Parcel'
      `);
            const [userStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN role = 'Resident' THEN 1 ELSE 0 END) as total_residents,
          SUM(CASE WHEN role = 'Security Guard' THEN 1 ELSE 0 END) as total_guards,
          SUM(CASE WHEN role = 'Admin' THEN 1 ELSE 0 END) as total_admins
        FROM users
      `);
            await connection.end();
            res.json({
                visitors: visitorStats[0],
                parcels: parcelStats[0],
                users: userStats[0]
            });
        }
        catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getQuickActions(req, res) {
        try {
            const connection = await (0, database_1.createConnection)();
            // Recent activities (last 24 hours)
            const [recentActivities] = await connection.execute(`
        SELECT vp.*, u1.name as resident_name, u2.name as security_guard_name
        FROM visitors_parcels vp
        JOIN users u1 ON vp.resident_id = u1.id
        JOIN users u2 ON vp.security_guard_id = u2.id
        WHERE vp.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY vp.created_at DESC
        LIMIT 10
      `);
            // Pending approvals
            const [pendingApprovals] = await connection.execute(`
        SELECT vp.*, u1.name as resident_name, u2.name as security_guard_name
        FROM visitors_parcels vp
        JOIN users u1 ON vp.resident_id = u1.id
        JOIN users u2 ON vp.security_guard_id = u2.id
        WHERE vp.status IN ('New', 'Waiting for Approval', 'Received')
        ORDER BY vp.created_at ASC
      `);
            // Active visitors
            const [activeVisitors] = await connection.execute(`
        SELECT vp.*, u1.name as resident_name, u2.name as security_guard_name
        FROM visitors_parcels vp
        JOIN users u1 ON vp.resident_id = u1.id
        JOIN users u2 ON vp.security_guard_id = u2.id
        WHERE vp.type = 'Visitor' AND vp.status IN ('Approved', 'Entered')
        ORDER BY vp.created_at DESC
      `);
            await connection.end();
            res.json({
                recentActivities,
                pendingApprovals,
                activeVisitors
            });
        }
        catch (error) {
            console.error('Quick actions error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getReports(req, res) {
        try {
            const { period = 'week', type } = req.query;
            const connection = await (0, database_1.createConnection)();
            let dateFilter = '';
            switch (period) {
                case 'today':
                    dateFilter = 'DATE(created_at) = CURDATE()';
                    break;
                case 'week':
                    dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    break;
                case 'month':
                    dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    break;
                default:
                    dateFilter = '1=1';
            }
            const typeFilter = type ? `AND type = '${type}'` : '';
            // Daily breakdown
            const [dailyStats] = await connection.execute(`
        SELECT 
          DATE(created_at) as date,
          type,
          COUNT(*) as count,
          status
        FROM visitors_parcels 
        WHERE ${dateFilter} ${typeFilter}
        GROUP BY DATE(created_at), type, status
        ORDER BY date DESC
      `);
            // Status distribution
            const [statusStats] = await connection.execute(`
        SELECT 
          status,
          type,
          COUNT(*) as count
        FROM visitors_parcels 
        WHERE ${dateFilter} ${typeFilter}
        GROUP BY status, type
      `);
            // Resident activity
            const [residentStats] = await connection.execute(`
        SELECT 
          u.name as resident_name,
          COUNT(*) as total_entries,
          SUM(CASE WHEN vp.type = 'Visitor' THEN 1 ELSE 0 END) as visitors,
          SUM(CASE WHEN vp.type = 'Parcel' THEN 1 ELSE 0 END) as parcels
        FROM visitors_parcels vp
        JOIN users u ON vp.resident_id = u.id
        WHERE ${dateFilter} ${typeFilter}
        GROUP BY vp.resident_id, u.name
        ORDER BY total_entries DESC
        LIMIT 10
      `);
            await connection.end();
            res.json({
                dailyStats,
                statusStats,
                residentStats
            });
        }
        catch (error) {
            console.error('Reports error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async bulkStatusUpdate(req, res) {
        try {
            const { ids, status, notes } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'IDs array is required' });
            }
            const connection = await (0, database_1.createConnection)();
            const placeholders = ids.map(() => '?').join(',');
            await connection.execute(`UPDATE visitors_parcels SET status = ?, notes = ?, updated_at = NOW() WHERE id IN (${placeholders})`, [status, notes, ...ids]);
            await connection.end();
            res.json({ message: `${ids.length} records updated successfully` });
        }
        catch (error) {
            console.error('Bulk update error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async exportData(req, res) {
        try {
            const { type, period = 'month' } = req.query;
            let dateFilter = '';
            switch (period) {
                case 'today':
                    dateFilter = 'DATE(vp.created_at) = CURDATE()';
                    break;
                case 'week':
                    dateFilter = 'vp.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    break;
                case 'month':
                    dateFilter = 'vp.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    break;
                default:
                    dateFilter = '1=1';
            }
            const typeFilter = type ? `AND vp.type = '${type}'` : '';
            const connection = await (0, database_1.createConnection)();
            const [records] = await connection.execute(`
        SELECT 
          vp.*,
          u1.name as resident_name,
          u1.email as resident_email,
          u2.name as security_guard_name
        FROM visitors_parcels vp
        JOIN users u1 ON vp.resident_id = u1.id
        JOIN users u2 ON vp.security_guard_id = u2.id
        WHERE ${dateFilter} ${typeFilter}
        ORDER BY vp.created_at DESC
      `);
            await connection.end();
            res.json({ data: records });
        }
        catch (error) {
            console.error('Export data error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AdminController = AdminController;
