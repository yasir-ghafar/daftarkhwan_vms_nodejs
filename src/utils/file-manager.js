const fs = require('fs').promises;
const path = require('path');
const { ServerConfig } = require('../config');

const resolveUploadPath = (...parts) => path.join(ServerConfig.UPLOAD_DIR, ...parts);

// Delete a file from the uploads directory
// filePath -> absolute path, or path relative to UPLOAD_DIR, or bare filename
const deleteFile = async (filePath) => {
    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : resolveUploadPath(filePath);
        await fs.unlink(absolutePath);
        return true;
    } catch (error) {
        console.log('Error deleting file:', error);
        return false;
    }
}

// Get file URL for sending in response
const getFileUrl = (filename, folder = 'locations') => {
    if (!filename) return null;

    // If it's already a full URL, return it
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }

    const baseUrl = ServerConfig.BASE_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Clean the filename - remove any path components
    const cleanFilename = path.basename(filename);

    // Return the full URL based on folder type
    return `${baseUrl}/api/images/${folder}/${cleanFilename}`;
}

// Get relative path for database storage (simpler version)
const getRelativePath = (filename, folder = 'locations') => {
    if (!filename) return null;

    // If it's already a full path, extract just the filename
    const cleanFilename = path.basename(filename);

    // Return just the filename (not full path) for database storage
    return cleanFilename;
}

// Get the storage path for new uploads based on type
const getStoragePath = (filename, type = 'location') => {
    if (!filename) return null;

    if (type === 'location') {
        return resolveUploadPath('locations', filename);
    } else if (type === 'meeting-room') {
        return resolveUploadPath('room', filename);
    } else if (type === 'profile') {
        return resolveUploadPath('profile', filename);
    } else {
        return resolveUploadPath(filename);
    }
}

// Validates if the file exists
const fileExists = async (filePath) => {
    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : resolveUploadPath(filePath);
        await fs.access(absolutePath);
        return true;
    } catch {
        return false;
    }
}


// Get just the filename from a path
const getFilename = (filePath) => {
    if (!filePath) return null;
    return path.basename(filePath);
}

module.exports = {
    deleteFile,
    getFileUrl,
    getRelativePath,
    getStoragePath,
    fileExists,
    getFilename,
    resolveUploadPath
}
