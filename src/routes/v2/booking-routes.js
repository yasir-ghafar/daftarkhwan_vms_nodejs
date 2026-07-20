const express = require('express');
const { BookingController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

/// Get bookings with pagination (limit: 10)
router.get('/',
    AuthMiddlewares.getUserAndGetUserId,
    BookingController.getBookingsPaginated);

module.exports = router;
