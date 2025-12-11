const express = require('express');
const { LocationController } = require('../../controllers');
const { LocationMiddlewares, AuthMiddlewares,} = require('../../middlewares');
const { uploadMiddlewares } = require('../../middlewares/upload-middlewares');
const router = express.Router();

// req => is just like in other apis, give information about the api call
// file =>  gives us the information about the uploaded file, like name, type, extention etc.
// cb => is a call back function
// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '..', '..', 'public', 'images'));
//         //cb(null, path.join(__dirname, '..', 'public', 'images')); /// use this to upload it to render
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `${Date.now()}_${Math.random()}${ext}`);
//     },
    
// });

// const imageFileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only image files are allowed!"), false);
//     }
// };

// const imageUpload = multer({
//     storage: imageStorage,
//     fileFilter: imageFileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, //5mb
// });
    // router.post(
    //     '/',
    //     AuthMiddlewares.getUserAndGetUserId,
    //     AuthMiddlewares.authorizeRoles('admin'),
    //     imageUpload.single("image"),
    //     LocationController.createLocation,
    // );
// /api/v1/locations POST
router.post(
    '/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    uploadMiddlewares.locationImage,
    LocationController.createLocation,
    );

router.get('/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    LocationController.getLocationById);

    /// get all locations
router.get('/',LocationController.getLocations);

    /// delete location
router.delete('/delete/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    LocationController.deleteLocation);

router.put('/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    //imageUpload.single("image"),
    LocationController.updateLocation);

module.exports = router;
