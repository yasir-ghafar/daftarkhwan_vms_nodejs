const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Absolute path for uploaded images.
// Local default: <project>/public/images
// Production (outside repo): e.g. /var/www/html/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'public', 'images');

module.exports = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    BASE_URL: process.env.BASE_URL,
    UPLOAD_DIR
}
