import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.validateRegister, AuthController.register);
router.post('/login', AuthController.validateLogin, AuthController.login);
router.get('/residents', authenticate, authorize('Security Guard', 'Admin'), AuthController.getResidents);

export default router;