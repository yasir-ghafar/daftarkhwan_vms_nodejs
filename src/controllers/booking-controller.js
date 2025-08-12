const { StatusCodes } = require('http-status-codes');
const bookingService = require('../services/booking-service');
const { SuccessResponse } = require('../utils/common');



async function createBooking(req, res) {
    const { date, startTime, endTime, location_id, room_id, company_id, user_id, status, title, description } = req.body;
    
    try {
        const booking = await bookingService.bookMeetingRoom(
            { date, startTime, endTime, location_id, room_id, company_id, user_id, status, title, description }
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

async function cancelBooking(req, res) {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
        const result = await bookingService.cancelBooking(id, user_id);
        SuccessResponse.message = result;
        res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: error.message || 'Something went wrong while cancelling the booking.'
      });
    }
}

async function getBookings(req, res) {
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

async function getBookingsByUserId(req, res) {
    try {
        const { id } = req.params;
        console.log(id);

        const bookings = await bookingService.getAllBookingsByUserId(id);
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
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
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