import { pool } from '../config/database';

export interface VisitorParcel {
  id: number;
  resident_id: number;
  security_guard_id: number;
  type: 'Visitor' | 'Parcel';
  name: string;
  purpose_description: string;
  media?: string | null;
  vehicle_details?: string | null;
  status: string;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
  resident_name?: string;
  security_guard_name?: string;
}

export interface VisitorParcelFilters {
  type?: string;
  status?: string;
  resident_id?: number;
  date_from?: string;
  date_to?: string;
}

export class VisitorParcelModel {
  static readonly VISITOR_STATUSES = ['New', 'Approved', 'Rejected', 'Checked In', 'Checked Out'] as const;
  static readonly PARCEL_STATUSES = ['Received', 'Delivered', 'Returned'] as const;
  
  static async create(data: Omit<VisitorParcel, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO visitors_parcels 
         (resident_id, security_guard_id, type, name, purpose_description, media, vehicle_details, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.resident_id,
          data.security_guard_id,
          data.type,
          data.name,
          data.purpose_description,
          data.media || null,
          data.vehicle_details || null,
          data.status,
          data.notes || null
        ]
      );
      
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }
  
  static async findById(id: number): Promise<VisitorParcel | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT vp.*, 
                r.name as resident_name, 
                sg.name as security_guard_name
         FROM visitors_parcels vp
         LEFT JOIN users r ON vp.resident_id = r.id
         LEFT JOIN users sg ON vp.security_guard_id = sg.id
         WHERE vp.id = ?`,
        [id]
      );
      
      const records = rows as VisitorParcel[];
      return records.length > 0 ? records[0] : null;
    } finally {
      connection.release();
    }
  }
  
  static async findByResident(residentId: number, type?: string): Promise<VisitorParcel[]> {
    const connection = await pool.getConnection();
    try {
      let query = `SELECT vp.*, 
                          r.name as resident_name, 
                          sg.name as security_guard_name
                   FROM visitors_parcels vp
                   LEFT JOIN users r ON vp.resident_id = r.id
                   LEFT JOIN users sg ON vp.security_guard_id = sg.id
                   WHERE vp.resident_id = ?`;
      
      const params: (number | string)[] = [residentId];
      
      if (type && ['Visitor', 'Parcel'].includes(type)) {
        query += ' AND vp.type = ?';
        params.push(type);
      }
      
      query += ' ORDER BY vp.created_at DESC LIMIT 100';
      
      const [rows] = await connection.execute(query, params);
      return rows as VisitorParcel[];
    } finally {
      connection.release();
    }
  }
  
  static async findPendingApprovals(residentId: number): Promise<VisitorParcel[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT vp.*, 
                r.name as resident_name, 
                sg.name as security_guard_name
         FROM visitors_parcels vp
         LEFT JOIN users r ON vp.resident_id = r.id
         LEFT JOIN users sg ON vp.security_guard_id = sg.id
         WHERE vp.resident_id = ? AND vp.type = 'Visitor' AND vp.status = 'New'
         ORDER BY vp.created_at DESC
         LIMIT 50`,
        [residentId]
      );
      
      return rows as VisitorParcel[];
    } finally {
      connection.release();
    }
  }
  
  static async findAll(filters: VisitorParcelFilters): Promise<VisitorParcel[]> {
    const connection = await pool.getConnection();
    try {
      let query = `SELECT vp.*, 
                          r.name as resident_name, 
                          sg.name as security_guard_name
                   FROM visitors_parcels vp
                   LEFT JOIN users r ON vp.resident_id = r.id
                   LEFT JOIN users sg ON vp.security_guard_id = sg.id
                   WHERE 1=1`;
      
      const params: (string | number)[] = [];
      
      if (filters.type && ['Visitor', 'Parcel'].includes(filters.type)) {
        query += ' AND vp.type = ?';
        params.push(filters.type);
      }
      
      if (filters.status) {
        query += ' AND vp.status = ?';
        params.push(filters.status);
      }
      
      if (filters.resident_id) {
        query += ' AND vp.resident_id = ?';
        params.push(filters.resident_id);
      }
      
      if (filters.date_from) {
        query += ' AND DATE(vp.created_at) >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        query += ' AND DATE(vp.created_at) <= ?';
        params.push(filters.date_to);
      }
      
      query += ' ORDER BY vp.created_at DESC LIMIT 1000';
      
      const [rows] = await connection.execute(query, params);
      return rows as VisitorParcel[];
    } finally {
      connection.release();
    }
  }
  
  static async updateStatus(id: number, status: string, notes?: string | null): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE visitors_parcels SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, notes || null, id]
      );
      
      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }
  
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM visitors_parcels WHERE id = ?',
        [id]
      );
      
      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }
  
  static async getStatistics(): Promise<{
    totalVisitors: number;
    totalParcels: number;
    pendingVisitors: number;
    pendingParcels: number;
  }> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
           COUNT(CASE WHEN type = 'Visitor' THEN 1 END) as totalVisitors,
           COUNT(CASE WHEN type = 'Parcel' THEN 1 END) as totalParcels,
           COUNT(CASE WHEN type = 'Visitor' AND status = 'New' THEN 1 END) as pendingVisitors,
           COUNT(CASE WHEN type = 'Parcel' AND status = 'Received' THEN 1 END) as pendingParcels
         FROM visitors_parcels`
      );
      
      const stats = (rows as any[])[0];
      return {
        totalVisitors: stats.totalVisitors || 0,
        totalParcels: stats.totalParcels || 0,
        pendingVisitors: stats.pendingVisitors || 0,
        pendingParcels: stats.pendingParcels || 0
      };
    } finally {
      connection.release();
    }
  }
}