const { StatusCodes } = require('http-status-codes');
const { MeetingRoomRepository, AmenityRepository } = require('../repositories');
const AppError = require('../utils/error/app-error');
const amenity = require('../models/amenity');
const { log } = require('winston');

const meetingRoomRepository = new MeetingRoomRepository();
const amenityRepository = new AmenityRepository();

async function createMeetingRoom(data) {
    try {
        const meetinRoom = await meetingRoomRepository.create(data);
        return meetinRoom;
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Cannot create a new Meeting Room', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function getAllRooms() {
    try {
        const locations = await meetingRoomRepository.getAll();
        return locations
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Meeting Rooms', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
    
}


async function createAmenity(data) {
    try {
        const amenity = await amenityRepository.create(data);
        return amenity;
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to create new New Amenity', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function getAllamenities() {
    try {
        const amenities = await amenityRepository.getAll();
        return amenities
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Amenities', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function deleteAmenity(id) {
  try {
    const amenity = await amenityRepository.get(id);

    if (!amenity) {
      throw new AppError('Amenity not found', StatusCodes.NOT_FOUND);
    }

    const isDeleted = await amenityRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError('Failed to delete amenity', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      success: true,
      message: 'Amenity deleted successfully',
      data: null
    };
  } catch (error) {
    console.error(`Error in Service: ${error}`);

    if (error.name === 'SequelizeValidationError') {
      const explanation = error.errors.map(err => err.message);
      throw new AppError(explanation.join(', '), StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

async function addMeetingRoomCredits(id, data) {
    try {
        const meetingRoom = await meetingRoomRepository.update(id, data);
        return meetingRoom;
    } catch (error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Amenities', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}


module.exports = {
    createMeetingRoom,
    getAllRooms,
    createAmenity,
    getAllamenities,
    deleteAmenity,
    addMeetingRoomCredits
}