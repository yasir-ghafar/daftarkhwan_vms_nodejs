const express = require('express');

const { AuthMiddlewares } = require('../../middlewares');

const locationRoutes = require('./location-routes');
const authRoutes = require('./auth-routes');
const companyRoutes = require('./company-routes');
const memberRoutes = require('./member-route');
const roomRoutes = require('./meeting-room-route');
const bookingRoute = require('./booking-routes');
const amenitiyRoute = require('./amenity-route');


const router = express.Router();

router.use('/locations',
    locationRoutes);
router.use('/auth',
    authRoutes);
router.use('/company',
    AuthMiddlewares.getUserAndGetUserId,
    companyRoutes);
router.use('/members',
    AuthMiddlewares.getUserAndGetUserId,
    memberRoutes);
router.use('/meeting-rooms',
    roomRoutes);
router.use('/bookings',
    bookingRoute);
router.use('/amenities',
    AuthMiddlewares.getUserAndGetUserId,
    amenitiyRoute)

module.exports = router;
