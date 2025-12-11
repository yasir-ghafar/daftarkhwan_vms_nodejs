const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const { success, message } = require('./common/error-response');


const createUploader = (options = {}) => {
    const {
        destination = 'public/images',
        allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        maxFileSize = 5,
        useOriginalName = false,
        filenamePrefix = ''
    } = options;

    // Create directory if it doesn't exist
    const uploadPath = path.join(process.cwd(), destination);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Configure storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            let filename;
            
            if (useOriginalName) {
                const name = path.basename(file.originalname, ext)
                    .replace(/[^a-zA-Z0-9]/g, '_')
                    .toLowerCase();
                filename = `${filenamePrefix}${name}_${Date.now()}${ext}`;
            } else {
                filename = `${filenamePrefix}${Math.random().toString(36).substring(2, 15)}${ext}`;
            }
            
            cb(null, filename);
        }
    });

    // Configure file filter
    const fileFilter = (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
        }
    };

    // Create and return multer instance (without .single() or .array() here)
    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxFileSize * 1024 * 1024,
        }
    });
};

/**
 * Custom middleware to handle multer errors gracefully
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        let message = 'File upload error';
        
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File size too large';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field';
                break;
            case 'LIMIT_PART_COUNT':
                message = 'Too many parts in the request';
                break;
            case 'LIMIT_FIELD_KEY':
                message = 'Field name too long';
                break;
            case 'LIMIT_FIELD_VALUE':
                message = 'Field value too long';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'Too many fields';
                break;
        }
        
        return res.status(400).json({
            success: false,
            message
        });
    } else if (err) {
        // Other errors (like fileFilter errors)
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    }
    
    next();
};

module.exports = {
    createUploader,
    handleUploadError
};