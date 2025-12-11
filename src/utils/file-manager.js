const fs = require('fs').promises;
const path = require('path');
const { ServerConfig } = require('../config');

// Delete afile from the uploads directory
// filePath -> relative path to the file
// return success
const deleteFile = async (filePath) => {
    try {

        const absolutePath = path.join(process.cwd(), filePath);
        await fs.unlink(absolutePath);
        return true;

    } catch(error) {
        console.log('Error deleting file:', error);
        return false;
    }
}

// Get file URl for sending in response
// filePath -> Relative file path
// retrun full Url

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
        return path.join('public', 'images', 'locations', filename);
    } else if (type === 'meeting-room') {
        return path.join('public', 'images', 'meeting_room', filename);
    } else if (type === 'profile') {
        return path.join('public', 'images', 'profiles', filename);
    } else {
        return path.join('public', 'images', filename);
    }
}

// Validates if the file exists
// params filePath -> relative path to the file
// return success for Exists status

const fileExists = async (filePath) => {
    try {
        const absolutePath = path.join(process.cwd(), filePath);
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
    fileExists,
    getFilename
}