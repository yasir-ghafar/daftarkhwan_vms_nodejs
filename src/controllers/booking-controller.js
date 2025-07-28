const { StatusCodes } = require('http-status-codes');
const bookingService = require('../services/booking-service');
const { SuccessResponse } = require('../utils/common');



async function createBooking(req, res) {
    const { date, startTime, endTime, location_id, room_id, company_id, user_id } = req.body;

    try {
        const booking = await bookingService.bookMeetingRoom(
            { date, startTime, endTime, location_id, room_id, company_id, user_id }
        );
        return res
            .status(StatusCodes.CREATED)
            .json(booking);
    } catch(error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
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

module.exports = {
    createBooking,
    getBookings,
    cancelBooking
}