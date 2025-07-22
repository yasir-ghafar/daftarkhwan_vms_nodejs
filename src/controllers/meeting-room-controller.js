const { StatusCodes } = require('http-status-codes');
const { MeetingRoomService, } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { success } = require('../utils/common/error-response');
const { Console } = require('winston/lib/winston/transports');

async function createMeetingRoom(req, res) {
    try {
        console.log(req.body)
        const room = await MeetingRoomService.createMeetingRoom({
            name: req.body.name,
            creditsPerSlot: req.body.creditsPerSlot,
            pricePerCredit: req.body.pricePerCredit,
            seatingCapacity: req.body.seatingCapacity,
            image: req.body.image,
            openingTime: req.body.openingTime,
            closingTime: req.body.closingTime,
            floor: req.body.floor,
            availableDays: req.body.availableDays,
            LocationId: req.body.LocationId
        });

        SuccessResponse.data = room;
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
                
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function getAllRooms(req, res) {
    try {
        const rooms = await MeetingRoomService.getAllRooms();
        SuccessResponse.data = rooms;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(error.StatusCodes)
            .json(ErrorResponse)
    }
}


async function addCredits(req, res) {
    try {
        const id = req.params.id;
        const meetingRoom = await MeetingRoomService.addMeetingRoomCredits(id, req.body);
        SuccessResponse.data = meetingRoom;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
            
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(error.StatusCodes)
            .json(ErrorResponse)
    }
}


//// Amenities


async function createAmenity(req, res) {
    try {
        console.log(req.body)
        const amenity = await MeetingRoomService.createAmenity({
            name: req.body.name,
            image: req.body.image,
        });

        SuccessResponse.data = amenity;
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
                
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function getAllAmenities(req, res) {
    try {
        const amenities = await MeetingRoomService.getAllamenities();
        SuccessResponse.data = amenities;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(error.StatusCodes)
            .json(ErrorResponse)
    }
}

async function deleteAmenity(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Amenity ID is required'
      });
    }

    const response = await MeetingRoomService.deleteAmenity(id);

    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    console.error(`Error in Controller: ${error}`);

    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Something went wrong while deleting the amenity'
    });
  }
}

module.exports = {
createMeetingRoom,
getAllRooms,
createAmenity,
getAllAmenities,
deleteAmenity,
addCredits
}