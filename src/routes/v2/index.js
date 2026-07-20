const express = require('express');
const bookingRoute = require('./booking-routes');

const router = express.Router();

router.use('/bookings', bookingRoute);

module.exports = router;
