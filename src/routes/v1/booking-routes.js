const express = require('express');
const { BookingController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

/// Get booking by User Id
/// takes user id as query parameter
router.get('/user/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    BookingController.getBookingsByUserId);


/// Get Bookings by room id and date
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
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    BookingController.createBooking);


router.post('/cancel/:id',
    AuthMiddlewares.getUserAndGetUserId,
        AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    BookingController.cancelBooking);



module.exports = router;