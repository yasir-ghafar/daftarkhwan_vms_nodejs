const express = require('express');

const { AuthMiddlewares } = require('../../middlewares');

const authRoutes = require('./auth-routes');
const companyRoutes = require('./company-routes');
const bookingRoute = require('./booking-routes');
const router = express.Router();


router.use('/auth', authRoutes);

router.use('/company', AuthMiddlewares.getUserAndGetUserId,
    companyRoutes);

router.use('/bookings', bookingRoute);

module.exports = router;