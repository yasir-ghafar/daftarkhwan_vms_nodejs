const fs = require('fs').promises;
const path = require('path');
const { ServerConfig } = require('../config');

// Must match multer destination folders under UPLOAD_DIR
const UPLOAD_FOLDERS = {
    locations: 'locations',
    room: 'room',
    profile: 'profile',
};

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
const getFileUrl = (filename, folder = UPLOAD_FOLDERS.locations) => {
    if (!filename) return null;

    // If it's already a full URL, return it
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }

    // Normalize legacy/plural aliases to the on-disk folder names
    const folderAliases = { rooms: UPLOAD_FOLDERS.room, profiles: UPLOAD_FOLDERS.profile };
    const resolvedFolder = folderAliases[folder] || folder || UPLOAD_FOLDERS.locations;

    const baseUrl = ServerConfig.BASE_URL;
    const cleanFilename = path.basename(filename);

    return `${baseUrl}/api/images/${resolvedFolder}/${cleanFilename}`;
}

// Get relative path for database storage (simpler version)
const getRelativePath = (filename, folder = UPLOAD_FOLDERS.locations) => {
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
        return resolveUploadPath(UPLOAD_FOLDERS.locations, filename);
    } else if (type === 'meeting-room') {
        return resolveUploadPath(UPLOAD_FOLDERS.room, filename);
    } else if (type === 'profile') {
        return resolveUploadPath(UPLOAD_FOLDERS.profile, filename);
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
    resolveUploadPath,
    UPLOAD_FOLDERS,
}
