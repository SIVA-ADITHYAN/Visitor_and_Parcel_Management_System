import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

// Dashboard stats
router.get('/dashboard/stats', AdminController.getDashboardStats);

// Quick actions
router.get('/dashboard/quick-actions', AdminController.getQuickActions);

// Reports
router.get('/reports', AdminController.getReports);

// Bulk operations
router.put('/bulk/status-update', AdminController.bulkStatusUpdate);

// Export data
router.get('/export', AdminController.exportData);

export default router;