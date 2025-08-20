const { StatusCodes } = require('http-status-codes');
const { MeetingRoomService, } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { success } = require('../utils/common/error-response');
const { Console } = require('winston/lib/winston/transports');
const { json } = require('sequelize');
const moment = require('moment');

async function createMeetingRoom(req, res) {
    console.log("create Meeting Room method is called.");
    try {
        openingTime = moment(req.body.openingTime, "hh:mm:ss A").format("HH:mm:ss");
        closingTime = moment(req.body.closingTime, "hh:mm:ss A").format("HH:mm:ss");
        const room = await MeetingRoomService.createMeetingRoom({
            name: req.body.name,
            creditsPerSlot: req.body.creditsPerSlot,
            pricePerCredit: req.body.pricePerCredit,
            seatingCapacity: req.body.seatingCapacity,
            image: req.body.image,
            openingTime: openingTime,
            closingTime: closingTime,
            floor: req.body.floor,
            availableDays: req.body.availableDays,
            LocationId: req.body.locationId,
            status: req.body.status,
            amenities: req.body.amenities
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
        console.log('this method called.')
        const rooms = await MeetingRoomService.getAllRooms();
        SuccessResponse.data = rooms;
        SuccessResponse.message = 'Meeting Rooms Fetched Successfully!'
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse)
    }
}

async function getRoomById(req, res) {
    try {
        const {id} = req.params;
        if (!id) {
            ErrorResponse.message = 'Room Id is Required!';
            return res.status(StatusCodes.BAD_REQUEST)
                .json({ErrorResponse});
        }

        const room = await MeetingRoomService.getMeetingRoomById(id);

        SuccessResponse.data = room;

        return res.status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch(error) {
        console.log(error);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}


async function getMeetingRoomStatus(req, res) {
    try {
        const {id} = req.params;
        if (!id) {
            ErrorResponse.message = 'Room Id is Required!';
            return res.status(StatusCodes.BAD_REQUEST)
                .json({ErrorResponse});
        }

        const room = await MeetingRoomService.getMeetingRoomWithStatus(id);

        SuccessResponse.data = room;

        return res.status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch(error) {
        console.log(error);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}

async function getRoomsByLocationId(req, res) {
    try {
        const {id} = req.params;
        if (!id) {
            ErrorResponse.message = 'Location Id is Required!';
            return res.status(StatusCodes.BAD_REQUEST)
                .json({ErrorResponse});
        }
        const rooms = await MeetingRoomService.getRoomsByLocationId(id);

        SuccessResponse.data = rooms;
        SuccessResponse.message = 'Rooms Fetched Successfully!'

        return res.status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch(error) {
        console.log(error);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}

async function updateMeetingRoom(req, res) {
    try {
        const id = req.params.id;
        openingTime = moment(req.body.openingTime, "hh:mm:ss A").format("HH:mm:ss");
        closingTime = moment(req.body.closingTime, "hh:mm:ss A").format("HH:mm:ss");
        const meetingRoom = await MeetingRoomService.addMeetingRoomCredits(id, {
            name: req.body.name,
            creditsPerSlot: req.body.creditsPerSlot,
            pricePerCredit: req.body.pricePerCredit,
            seatingCapacity: req.body.seatingCapacity,
            image: req.body.image,
            openingTime: openingTime,
            closingTime: closingTime,
            floor: req.body.floor,
            availableDays: req.body.availableDays,
            LocationId: req.body.locationId,
            status: req.body.status,
            amenities: req.body.amenities
        });
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
        message: 'Amenity ID is required.'
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

async function deleteMeetingRoom(req, res) {
    console.log("Delete Meeting Room method is called.");
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Room ID is required.'
        });
    }

    const response = await MeetingRoomService.deleteRoom(id);
    return res.status(StatusCodes.OK).json(response);
    } catch(error) {
        console.error(`Error in Controller: ${error}`);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Something went wrong while deleting the Meeting Room'
    });
    }
}

module.exports = {
createMeetingRoom,
getRoomById,
getAllRooms,
deleteMeetingRoom,
createAmenity,
getAllAmenities,
deleteAmenity,
updateMeetingRoom,
getRoomsByLocationId,
getMeetingRoomStatus
}