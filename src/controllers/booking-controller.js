const { StatusCodes } = require('http-status-codes');
const bookingService = require('../services/booking-service');
const { SuccessResponse, ErrorResponse } = require('../utils/common');



/// Create a booking
async function createBooking(req, res) {
    const { date, startTime, endTime, location_id, room_id, company_id, user_id, status, title, description } = req.body;
    const booking_user = req.userId;
    console.log("UserID in Request: ", req.userId);

    try {
        const booking = await bookingService.bookMeetingRoom(
            { booking_user, date, startTime, endTime, location_id, room_id, company_id, user_id, status, title, description }
        );
        SuccessResponse.data = booking;
        SuccessResponse.message = "Booking Created Successfully!"
        return res
            .status(StatusCodes.CREATED)
            .json(SuccessResponse);
    } catch(error) {
        return res
            .status(error.statusCode)
            .json(error);
    }
}

/// Cancel Booking
async function cancelBooking(req, res) {
    console.log("userId in controller",req.userId);
    console.log("Role in controller",req.role);
    const { id } = req.params;
    const userId = req.userId;
    const isAdmin = req.role === 'admin';

    console.log("User is Admin", isAdmin);
    try {
        const result = await bookingService.cancelBooking(id, userId, isAdmin);
        SuccessResponse.message = result;
        SuccessResponse.data = {}
        res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        ErrorResponse.message = error.message || 'Something went wrong while cancelling the booking.'
        return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
    }
}

///Get All Bookings
async function getBookings(req, res) {
     console.log('getting in controller: getBookings');
    try {
        const bookings = await bookingService.getAllBookings();
        SuccessResponse.data = bookings;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);

    } catch(error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}

/// Get Bookings By User Id
async function getBookingsByUserId(req, res) {
    try {
        const { id } = req.params;
        console.log(id);

        const bookings = await bookingService.getAllBookingsByUserId(id);
        SuccessResponse.data = bookings;
        SuccessResponse.message = 'Bookings Fetched Successfully'
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);

    } catch(error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}

/// Get Bookings for a Room on specific date.
async function bookigsByRoomAndDate(req, res) {
    console.log('getting in controller');
    const { room_id, date } = req.query;

      console.log("Room Id", room_id);
      console.log("Date", date);
    try {
        const bookings = await bookingService.getBookingsByRoomIdAndDate(room_id,date);

        SuccessResponse.data = bookings;
        SuccessResponse.message = 'Bookings Fetched Successfully!'

        return res.status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        //console.log(`Error: ${error}`);
        ErrorResponse.error = error.message;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}


module.exports = {
    createBooking,
    getBookings,
    cancelBooking,
    bookigsByRoomAndDate,
    getBookingsByUserId
}