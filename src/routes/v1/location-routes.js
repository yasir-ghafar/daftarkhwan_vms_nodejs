const express = require('express');
const { LocationController } = require('../../controllers');
const { AuthMiddlewares,} = require('../../middlewares');
//const { uploadMiddlewares } = require('../../middlewares/upload-middlewares');
const router = express.Router();

// /api/v1/locations POST
router.post(
    '/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    //uploadMiddlewares.locationImage,
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
