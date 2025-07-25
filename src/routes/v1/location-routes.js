const express = require('express');
const multer = require('multer');
const path = require('path');

const { LocationController } = require('../../controllers');
const { LocationMiddlewares, AuthMiddlewares } = require('../../middlewares')
const router = express.Router();


// req => is just liek in other apis, give information about the api call
// file =>  gives us the information about the uploaded file, like name, type, extention etc.
// cb => is a call back function
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}_${Math.random()}${ext}`);
    },
    
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, //5mb
});


// /api/v1/locations POST
router.post(
    '/',
    //LocationMiddlewares.validateCreateLocationRequest,
    imageUpload.single("image"),
    LocationController.createLocation,
    );


    /// get all locations
router.get('/',
    LocationController.getLocations);

    /// delete location
router.delete('/delete',
    LocationController.deleteLocation);

module.exports = router;
