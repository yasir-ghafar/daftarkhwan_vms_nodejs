const { StatusCodes } = require('http-status-codes');
const { MeetingRoomRepository, AmenityRepository } = require('../repositories');
const AppError = require('../utils/error/app-error');
const { MeetingRoom  } = require('../models');
const { log } = require('winston');

const { Location } = require('../models');

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


async function getMeetingRoomById(id) {
  try {
    const room = await meetingRoomRepository.get(id);

    if (!room) {
      throw new AppError('Meeting Room Not Found', StatusCodes.NOT_FOUND);
    }

    return room;
  } catch(error) {
    if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Meeting Room', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
  }
}
async function getAllRooms() {
    try {
        const rooms = await meetingRoomRepository.getAll({
          include: [{
            model: Location,
            as: 'location',
            attributes: ['name'],
          }]
        });
        console.log(`${rooms}`)
        return rooms
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

async function updateMeetingRoom(id, data) {
  try {
    const room = await MeetingRoomRepository.get(id);

    if(!room) {
      throw new AppError('Meeting Room not Found!', StatusCodes.NOT_FOUND);
    }

    if (Array.isArray(data.availableDays)) {
      data.availableDays = JSON.stringify(data.availableDays);
    }

    const updatedRoom = await MeetingRoomRepository.update(id, data);

    return updatedRoom;
  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => err.message);
            throw new AppError(messages.join(', '), StatusCodes.BAD_REQUEST);
        }

        throw new AppError('Failed to update Meeting Room.', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function deleteRoom(id) {
  try {
    const room = await meetingRoomRepository.get(id);

    if (!room) {
      throw new AppError('Room not found', StatusCodes.NOT_FOUND);
    }

    const isDeleted = await meetingRoomRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError('Failed to delete Meeting room', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      success: true,
      message: 'Meeting Room deleted successfully',
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
    getMeetingRoomById,
    getAllRooms,
    deleteRoom,
    createAmenity,
    getAllamenities,
    deleteAmenity,
    addMeetingRoomCredits
}