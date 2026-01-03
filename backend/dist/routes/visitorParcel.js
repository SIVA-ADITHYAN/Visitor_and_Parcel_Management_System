"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const VisitorParcelController_1 = require("../controllers/VisitorParcelController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Security Guard routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('Security Guard'), upload.single('media'), VisitorParcelController_1.VisitorParcelController.validateCreate, VisitorParcelController_1.VisitorParcelController.create);
router.put('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('Security Guard', 'Resident'), VisitorParcelController_1.VisitorParcelController.validateStatusUpdate, VisitorParcelController_1.VisitorParcelController.updateStatus);
// Resident routes
router.get('/resident/pending', auth_1.authenticate, (0, auth_1.authorize)('Resident'), VisitorParcelController_1.VisitorParcelController.getPendingApprovals);
router.get('/resident/:residentId?', auth_1.authenticate, (0, auth_1.authorize)('Resident', 'Security Guard', 'Admin'), VisitorParcelController_1.VisitorParcelController.getByResident);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('Admin', 'Security Guard'), VisitorParcelController_1.VisitorParcelController.getAll);
router.get('/:id', auth_1.authenticate, VisitorParcelController_1.VisitorParcelController.getById);
exports.default = router;
