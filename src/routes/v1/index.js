const express = require('express');

const locationRoutes = require('./location-routes');
const authRoutes = require('./auth-routes');
const companyRoutes = require('./company-routes');
const memberRoutes = require('./member-route');
const roomRoutes = require('./meeting-room-route');
const bookingRoute = require('./booking-routes');

const router = express.Router();

router.use('/locations', locationRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/members', memberRoutes);
router.use('/meeting-rooms', roomRoutes);
router.use('/bookings', bookingRoute);

module.exports = router;
