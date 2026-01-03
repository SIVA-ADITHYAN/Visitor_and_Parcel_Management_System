"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorParcelController = void 0;
const express_validator_1 = require("express-validator");
const VisitorParcel_1 = require("../models/VisitorParcel");
class VisitorParcelController {
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { resident_id, type, name, purpose_description, vehicle_details, notes } = req.body;
            const security_guard_id = req.user.id;
            const data = {
                resident_id: parseInt(resident_id),
                security_guard_id,
                type,
                name: name.trim(),
                purpose_description: purpose_description.trim(),
                vehicle_details: vehicle_details?.trim() || null,
                notes: notes?.trim() || null,
                media: req.file?.path || null,
                status: type === 'Visitor' ? 'New' : 'Received'
            };
            const id = await VisitorParcel_1.VisitorParcelModel.create(data);
            const record = await VisitorParcel_1.VisitorParcelModel.findById(id);
            if (!record) {
                return res.status(500).json({ message: 'Failed to create record' });
            }
            return res.status(201).json({
                message: `${type} logged successfully`,
                data: record
            });
        }
        catch (error) {
            console.error('Create error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getByResident(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const residentId = req.user.role === 'Resident'
                ? req.user.id
                : parseInt(req.params.residentId) || req.user.id;
            const { type } = req.query;
            if (type && !['Visitor', 'Parcel'].includes(type)) {
                return res.status(400).json({ message: 'Invalid type parameter' });
            }
            const records = await VisitorParcel_1.VisitorParcelModel.findByResident(residentId, type);
            return res.json({ data: records });
        }
        catch (error) {
            console.error('Get by resident error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getPendingApprovals(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const residentId = req.user.id;
            const records = await VisitorParcel_1.VisitorParcelModel.findPendingApprovals(residentId);
            return res.json({ data: records });
        }
        catch (error) {
            console.error('Get pending approvals error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { id } = req.params;
            const recordId = parseInt(id);
            if (isNaN(recordId) || recordId <= 0) {
                return res.status(400).json({ message: 'Invalid ID parameter' });
            }
            const { status, notes } = req.body;
            const record = await VisitorParcel_1.VisitorParcelModel.findById(recordId);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            // Validate status transition
            const validStatuses = record.type === 'Visitor'
                ? VisitorParcel_1.VisitorParcelModel.VISITOR_STATUSES
                : VisitorParcel_1.VisitorParcelModel.PARCEL_STATUSES;
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status',
                    validStatuses
                });
            }
            const updated = await VisitorParcel_1.VisitorParcelModel.updateStatus(recordId, status.trim(), notes?.trim() || null);
            if (!updated) {
                return res.status(404).json({ message: 'Failed to update status' });
            }
            const updatedRecord = await VisitorParcel_1.VisitorParcelModel.findById(recordId);
            return res.json({
                message: 'Status updated successfully',
                data: updatedRecord
            });
        }
        catch (error) {
            console.error('Update status error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { type, status, resident_id, date_from, date_to } = req.query;
            // Validate type parameter
            if (type && !['Visitor', 'Parcel'].includes(type)) {
                return res.status(400).json({ message: 'Invalid type parameter' });
            }
            const filters = {
                type: type,
                status: status,
                resident_id: resident_id ? parseInt(resident_id) : undefined,
                date_from: date_from,
                date_to: date_to
            };
            const records = await VisitorParcel_1.VisitorParcelModel.findAll(filters);
            return res.json({
                data: records,
                total: records.length
            });
        }
        catch (error) {
            console.error('Get all error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { id } = req.params;
            const recordId = parseInt(id);
            if (isNaN(recordId) || recordId <= 0) {
                return res.status(400).json({ message: 'Invalid ID parameter' });
            }
            const record = await VisitorParcel_1.VisitorParcelModel.findById(recordId);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            return res.json({ data: record });
        }
        catch (error) {
            console.error('Get by ID error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async delete(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Only admins can delete records
            if (req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            const { id } = req.params;
            const recordId = parseInt(id);
            if (isNaN(recordId) || recordId <= 0) {
                return res.status(400).json({ message: 'Invalid ID parameter' });
            }
            const record = await VisitorParcel_1.VisitorParcelModel.findById(recordId);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            const deleted = await VisitorParcel_1.VisitorParcelModel.delete(recordId);
            if (!deleted) {
                return res.status(500).json({ message: 'Failed to delete record' });
            }
            return res.json({ message: 'Record deleted successfully' });
        }
        catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.VisitorParcelController = VisitorParcelController;
VisitorParcelController.validateCreate = [
    (0, express_validator_1.body)('resident_id').isInt({ min: 1 }).withMessage('Valid resident ID is required'),
    (0, express_validator_1.body)('type').isIn(['Visitor', 'Parcel']).withMessage('Type must be Visitor or Parcel'),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    (0, express_validator_1.body)('purpose_description').trim().isLength({ min: 5, max: 1000 }).withMessage('Purpose/Description must be 5-1000 characters'),
    (0, express_validator_1.body)('vehicle_details').optional().trim().isLength({ max: 255 }).withMessage('Vehicle details max 255 characters'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes max 1000 characters')
];
VisitorParcelController.validateStatusUpdate = [
    (0, express_validator_1.body)('status').trim().notEmpty().withMessage('Status is required'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes max 1000 characters')
];
