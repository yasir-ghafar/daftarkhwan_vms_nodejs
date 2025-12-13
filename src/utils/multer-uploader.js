const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (options = {}) => {
    const {
        destination = 'public/images',
        allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ],
        maxFileSize = 5,
        useOriginalName = false,
        filenamePrefix = ''
    } = options;

    const uploadPath = path.join(process.cwd(), destination);
    let isUploadEnabled = true;

    /**
     * Safe directory creation
     * Never crash the app
     */
    try {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Extra safety: check write permission
        fs.accessSync(uploadPath, fs.constants.W_OK);
    } catch (err) {
        isUploadEnabled = false;
        console.error(
            `[UPLOAD DISABLED] Cannot write to ${uploadPath}: ${err.message}`
        );
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!isUploadEnabled) {
                return cb(new Error('File uploads are temporarily disabled'), null);
            }
            cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);

            let filename;
            if (useOriginalName) {
                const name = path
                    .basename(file.originalname, ext)
                    .replace(/[^a-zA-Z0-9]/g, '_')
                    .toLowerCase();

                filename = `${filenamePrefix}${name}_${Date.now()}${ext}`;
            } else {
                filename = `${filenamePrefix}${Math.random()
                    .toString(36)
                    .substring(2, 15)}${ext}`;
            }

            cb(null, filename);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (!isUploadEnabled) {
            return cb(new Error('File uploads are temporarily disabled'), false);
        }

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`
                ),
                false
            );
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxFileSize * 1024 * 1024
        }
    });
};

module.exports = {
    createUploader
};
