const { StatusCodes } = require('http-status-codes');
const bookingService = require('../services/booking-service');

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

module.exports = {
    createBooking
}