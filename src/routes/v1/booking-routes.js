const express = require('express');
const { BookingController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.get('/user/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    BookingController.getBookingsByUserId);

router.get('/by-room-and-date',
    BookingController.bookigsByRoomAndDate);

router.get('/:id',
    AuthMiddlewares.getUserAndGetUserId,
    BookingController.getBookings);

router.get('/',
    AuthMiddlewares.getUserAndGetUserId,
    BookingController.getBookings);

router.post('/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    BookingController.createBooking);


router.post('/cancel/:id',
    AuthMiddlewares.authorizeRoles('admin'),
    AuthMiddlewares.getUserAndGetUserId,
    BookingController.cancelBooking);



module.exports = router;