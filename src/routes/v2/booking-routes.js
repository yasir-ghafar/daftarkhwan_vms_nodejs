const express = require('express');
const { BookingController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');



const router = express.Router();


/// Create Booking Route
router.post('/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    BookingController.createBookingWithCompanyWallet);


module.exports = router;

