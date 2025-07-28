const express = require('express');
const { BookingController } = require('../../controllers');

const router = express.Router();

router.get('/:id', BookingController.getBookings);
router.get('/', BookingController.getBookings);

router.post('/', BookingController.createBooking);
router.post('/cancel/:id', BookingController.cancelBooking);

module.exports = router;