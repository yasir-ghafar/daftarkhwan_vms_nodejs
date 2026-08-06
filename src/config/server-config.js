const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Absolute path for uploaded images.
// Local default: <project>/public/images
// Production (outside repo): e.g. /var/www/html/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'public', 'images');

// Public API origin used when building image URLs (no trailing slash).
// Must be set in production, e.g. https://api.example.com
const rawBaseUrl = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');
const PORT = process.env.PORT || 3000;
const BASE_URL = rawBaseUrl || `http://localhost:${PORT}`;
const isLocalhostBaseUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(BASE_URL);
const isProduction = process.env.NODE_ENV === 'production';

if (!rawBaseUrl) {
    console.warn(
        '[CONFIG] BASE_URL is not set. Image URLs will use ' +
        `${BASE_URL}. Set BASE_URL to your public API origin in production.`
    );
} else if (isProduction && isLocalhostBaseUrl) {
    console.warn(
        `[CONFIG] BASE_URL is set to ${BASE_URL} while NODE_ENV=production. ` +
        'Clients will receive localhost image URLs. Set BASE_URL to your public API origin.'
    );
}

module.exports = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    BASE_URL,
    UPLOAD_DIR
}
