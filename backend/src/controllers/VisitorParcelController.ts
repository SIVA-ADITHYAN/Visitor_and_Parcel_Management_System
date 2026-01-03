import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { VisitorParcelModel } from '../models/VisitorParcel';
import { AuthRequest } from '../middleware/auth';

export class VisitorParcelController {
  static validateCreate = [
    body('resident_id').isInt().withMessage('Valid resident ID is required'),
    body('type').isIn(['Visitor', 'Parcel']).withMessage('Type must be Visitor or Parcel'),
    body('name').notEmpty().withMessage('Name is required'),
    body('purpose_description').notEmpty().withMessage('Purpose/Description is required'),
  ];
  
  static validateStatusUpdate = [
    body('status').notEmpty().withMessage('Status is required'),
  ];
  
  static async create(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      
      const { resident_id, type, name, purpose_description, vehicle_details, notes } = req.body;
      const security_guard_id = req.user.id;
      
      const data = {
        resident_id,
        security_guard_id,
        type,
        name,
        purpose_description,
        vehicle_details,
        notes,
        media: req.file?.path,
        status: type === 'Visitor' ? 'New' : 'Received'
      };
      
      const id = await VisitorParcelModel.create(data);
      const record = await VisitorParcelModel.findById(id);
      
      res.status(201).json({
        message: `${type} logged successfully`,
        data: record
      });
    } catch (error) {
      console.error('Create error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async getByResident(req: AuthRequest, res: Response) {
    try {
      const residentId = req.user.role === 'Resident' ? req.user.id : parseInt(req.params.residentId);
      const { type } = req.query;
      
      const records = await VisitorParcelModel.findByResident(residentId, type as string);
      
      res.json({ data: records });
    } catch (error) {
      console.error('Get by resident error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async getPendingApprovals(req: AuthRequest, res: Response) {
    try {
      const residentId = req.user.id;
      const records = await VisitorParcelModel.findPendingApprovals(residentId);
      
      res.json({ data: records });
    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const record = await VisitorParcelModel.findById(parseInt(id));
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      const updated = await VisitorParcelModel.updateStatus(parseInt(id), status, notes);
      
      if (!updated) {
        return res.status(404).json({ message: 'Failed to update status' });
      }
      
      const updatedRecord = await VisitorParcelModel.findById(parseInt(id));
      
      res.json({
        message: 'Status updated successfully',
        data: updatedRecord
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { type, status } = req.query;
      const filters = { type: type as string, status: status as string };
      
      const records = await VisitorParcelModel.findAll(filters);
      
      res.json({ data: records });
    } catch (error) {
      console.error('Get all error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const record = await VisitorParcelModel.findById(parseInt(id));
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      res.json({ data: record });
    } catch (error) {
      console.error('Get by ID error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}