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

/// Search bookings by location, meeting room, company and/or user
router.get('/search',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    BookingController.searchBookings);

router.get('/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    BookingController.getBookingById);

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