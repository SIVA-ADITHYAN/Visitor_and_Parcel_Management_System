import { Router } from 'express';
import { VisitorParcelController } from '../controllers/VisitorParcelController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/create', authenticate, authorize('Security Guard'), VisitorParcelController.validateCreate, VisitorParcelController.create);
router.get('/resident/:residentId?', authenticate, VisitorParcelController.getByResident);
router.get('/pending-approvals', authenticate, authorize('Resident'), VisitorParcelController.getPendingApprovals);
router.put('/:id/status', authenticate, VisitorParcelController.validateStatusUpdate, VisitorParcelController.updateStatus);
router.get('/all', authenticate, authorize('Admin', 'Security Guard'), VisitorParcelController.getAll);
router.get('/:id', authenticate, VisitorParcelController.getById);

export default router;