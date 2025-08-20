const express = require('express');
const { BookingController } = require('../../controllers');

const router = express.Router();

router.get('/user/:id', BookingController.getBookingsByUserId);

router.get('/by-room-and-date', BookingController.bookigsByRoomAndDate);


router.get('/:id', BookingController.getBookings);
router.get('/', BookingController.getBookings);

router.post('/', BookingController.createBooking);
router.post('/cancel/:id', BookingController.cancelBooking);



module.exports = router;