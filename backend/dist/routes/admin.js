"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All admin routes require authentication and admin role
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['Admin']));
// Dashboard stats
router.get('/dashboard/stats', AdminController_1.AdminController.getDashboardStats);
// Quick actions
router.get('/dashboard/quick-actions', AdminController_1.AdminController.getQuickActions);
// Reports
router.get('/reports', AdminController_1.AdminController.getReports);
// Bulk operations
router.put('/bulk/status-update', AdminController_1.AdminController.bulkStatusUpdate);
// Export data
router.get('/export', AdminController_1.AdminController.exportData);
exports.default = router;
