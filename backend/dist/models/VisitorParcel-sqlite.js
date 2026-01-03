"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorParcelModel = void 0;
const database_sqlite_1 = require("../config/database-sqlite");
class VisitorParcelModel {
    static async create(data) {
        const initialStatus = data.type === 'Visitor' ? 'New' : 'Received';
        const result = await (0, database_sqlite_1.execute)(`INSERT INTO visitors_parcels 
       (resident_id, security_guard_id, type, name, purpose_description, media, vehicle_details, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.resident_id, data.security_guard_id, data.type, data.name, data.purpose_description,
            data.media, data.vehicle_details, initialStatus, data.notes]);
        return result.insertId;
    }
    static async findById(id) {
        const record = await (0, database_sqlite_1.getOne)(`SELECT vp.*, u1.name as resident_name, u2.name as security_guard_name 
       FROM visitors_parcels vp 
       JOIN users u1 ON vp.resident_id = u1.id 
       JOIN users u2 ON vp.security_guard_id = u2.id 
       WHERE vp.id = ?`, [id]);
        return record || null;
    }
    static async findByResident(residentId, type) {
        let sql = `SELECT vp.*, u2.name as security_guard_name 
               FROM visitors_parcels vp 
               JOIN users u2 ON vp.security_guard_id = u2.id 
               WHERE vp.resident_id = ?`;
        const params = [residentId];
        if (type) {
            sql += ' AND vp.type = ?';
            params.push(type);
        }
        sql += ' ORDER BY vp.created_at DESC';
        return await (0, database_sqlite_1.query)(sql, params);
    }
    static async findPendingApprovals(residentId) {
        return await (0, database_sqlite_1.query)(`SELECT vp.*, u2.name as security_guard_name 
       FROM visitors_parcels vp 
       JOIN users u2 ON vp.security_guard_id = u2.id 
       WHERE vp.resident_id = ? AND vp.type = 'Visitor' AND vp.status IN ('New', 'Waiting for Approval')
       ORDER BY vp.created_at DESC`, [residentId]);
    }
    static async updateStatus(id, status, notes) {
        const result = await (0, database_sqlite_1.execute)('UPDATE visitors_parcels SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, notes, id]);
        return result.affectedRows > 0;
    }
    static async findAll(filters) {
        let sql = `SELECT vp.*, u1.name as resident_name, u2.name as security_guard_name 
               FROM visitors_parcels vp 
               JOIN users u1 ON vp.resident_id = u1.id 
               JOIN users u2 ON vp.security_guard_id = u2.id`;
        const params = [];
        const conditions = [];
        if (filters?.type) {
            conditions.push('vp.type = ?');
            params.push(filters.type);
        }
        if (filters?.status) {
            conditions.push('vp.status = ?');
            params.push(filters.status);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY vp.created_at DESC';
        return await (0, database_sqlite_1.query)(sql, params);
    }
}
exports.VisitorParcelModel = VisitorParcelModel;
VisitorParcelModel.VISITOR_STATUSES = ['New', 'Waiting for Approval', 'Approved', 'Entered', 'Exited'];
VisitorParcelModel.PARCEL_STATUSES = ['Received', 'Acknowledged', 'Collected'];
