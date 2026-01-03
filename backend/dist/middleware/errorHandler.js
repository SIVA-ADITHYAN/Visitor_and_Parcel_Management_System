"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler = (error, req, res, next) => {
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Multer errors
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.',
                error: 'FILE_TOO_LARGE'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files uploaded.',
                error: 'TOO_MANY_FILES'
            });
        }
    }
    // Validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            error: 'VALIDATION_ERROR'
        });
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired',
            error: 'TOKEN_EXPIRED'
        });
    }
    // Database errors
    if (error.message.includes('ER_DUP_ENTRY')) {
        return res.status(409).json({
            message: 'Duplicate entry',
            error: 'DUPLICATE_ENTRY'
        });
    }
    // Default error
    const statusCode = error.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;
    return res.status(statusCode).json({
        message,
        error: 'INTERNAL_ERROR'
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return res.status(404).json({
        message: `Route ${req.originalUrl} not found`,
        error: 'NOT_FOUND'
    });
};
exports.notFoundHandler = notFoundHandler;
