const { createUploader, handleUploadError } = require('../utils/multer-uploader');

// Middleware factory for handling file uploads
const uploadMiddleware = (config = {}) => {
    const options = (config && typeof config === 'object') ? config : {};
    const uploader = createUploader(options).single('image');

    // return a middleware function that wraps both uploader and error handler
    return (req, res, next) => {
        uploader(req, res, (err) => {
            if (err) {
                return handleUploadError(err, req, res, next);
            }
            next();
        });
    };
};

/// Pre-defined upload middlewares for different routes
const uploadMiddlewares = {

    // single image upload
    singleImage: uploadMiddleware(),

    // location-specific image upload
    locationImage: uploadMiddleware({
        destination: 'public/images/locations',
        filenamePrefix: 'location_'
    }),

    // room-specific image upload
    meetingRoomImage: uploadMiddleware({
        destination: 'public/images/room',
        filenamePrefix: 'room_'
    }),

    // profile-specific image upload
    profileImage: uploadMiddleware({
        destination: 'public/images/profile',
        filenamePrefix: 'profile_'
    })
}


module.exports = {
    uploadMiddleware,
    uploadMiddlewares,
    handleUploadError
}
