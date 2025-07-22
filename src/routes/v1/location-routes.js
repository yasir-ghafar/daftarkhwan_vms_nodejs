const express = require('express');

const { LocationController } = require('../../controllers');
const { LocationMiddlewares, AuthMiddlewares } = require('../../middlewares')
const router = express.Router();

// /api/v1/locations POST

router.post(
    '/',
    LocationMiddlewares.validateCreateLocationRequest,
    LocationController.createLocation);


router.get('/',
    LocationController.getLocations);


module.exports = router;
