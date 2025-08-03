const { StatusCodes } = require("http-status-codes");
const { MeetingRoomRepository, AmenityRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");
const { MeetingRoom } = require("../models");
const { log } = require("winston");

const { Location, Booking } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const meetingRoomRepository = new MeetingRoomRepository();
const amenityRepository = new AmenityRepository();

async function createMeetingRoom(data) {
  try {
    const meetinRoom = await meetingRoomRepository.create(data);
    return meetinRoom;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Meeting Room",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getMeetingRoomById(id) {
  try {
    const room = await meetingRoomRepository.get(id);

    if (!room) {
      throw new AppError("Meeting Room Not Found", StatusCodes.NOT_FOUND);
    }

    return room;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Meeting Room",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}
async function getAllRooms() {
  try {
    const rooms = await meetingRoomRepository.getAll({
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["name"],
        },
      ],
    });
    console.log(`${rooms}`);
    return rooms;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Meeting Rooms",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

// async function getRoomsByLocationId(locationId) {
//   try {
//     const rooms = await meetingRoomRepository.getAll({
//       where: {locationId},
//       include: [{
//         model: Location,
//         as: 'location',
//         attributes:['name']
//       }]
//     });

//     if (!rooms || rooms.length === 0) {
//       throw new AppError('No Meeting Room found for the given Location', StatusCodes.NOT_FOUND);
//     }

//     return rooms;
//   } catch (error) {
//     if (error.name === 'SequelizeValidationError') {
//       const messages = error.errors.map(err => err.message);
//       throw new AppError(messages.join(', '), StatusCodes.BAD_REQUEST);
//     }

//     throw new AppError('Failed to fetch Meeting Rooms by Location ID', StatusCodes.INTERNAL_SERVER_ERROR);
//   }
// }

async function updateMeetingRoom(id, data) {
  try {
    const room = await MeetingRoomRepository.get(id);

    if (!room) {
      throw new AppError("Meeting Room not Found!", StatusCodes.NOT_FOUND);
    }

    if (Array.isArray(data.availableDays)) {
      data.availableDays = JSON.stringify(data.availableDays);
    }

    const updatedRoom = await MeetingRoomRepository.update(id, data);

    return updatedRoom;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Failed to update Meeting Room.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function deleteRoom(id) {
  try {
    const room = await meetingRoomRepository.get(id);

    if (!room) {
      throw new AppError("Room not found", StatusCodes.NOT_FOUND);
    }

    const isDeleted = await meetingRoomRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError(
        "Failed to delete Meeting room",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      message: "Meeting Room deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error(`Error in Service: ${error}`);

    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map((err) => err.message);
      throw new AppError(explanation.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

async function createAmenity(data) {
  try {
    const amenity = await amenityRepository.create(data);
    return amenity;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to create new New Amenity",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getAllamenities() {
  try {
    const amenities = await amenityRepository.getAll();
    return amenities;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Amenities",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function deleteAmenity(id) {
  try {
    const amenity = await amenityRepository.get(id);

    if (!amenity) {
      throw new AppError("Amenity not found", StatusCodes.NOT_FOUND);
    }

    const isDeleted = await amenityRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError(
        "Failed to delete amenity",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      message: "Amenity deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error(`Error in Service: ${error}`);

    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map((err) => err.message);
      throw new AppError(explanation.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

async function addMeetingRoomCredits(id, data) {
  try {
    const meetingRoom = await meetingRoomRepository.update(id, data);
    return meetingRoom;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Amenities",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getRoomsByLocationId(locationId) {
  try {
    const rooms = await meetingRoomRepository.getAll({
      where: { locationId },
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["name"],
        },
        {
          model: Booking,
          required: false, // allow rooms with no bookings
        },
      ],
    });

    const today = moment().format("YYYY-MM-DD");
    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");

    const roomsWithSlots = rooms.map((room) => {
      const bookingsToday = (room.Bookings || []).filter((booking) => {
        return booking.date === today;
      });

      const opening = moment(
        todayStart.format("YYYY-MM-DD") + " " + room.openingTime
      );
      const closing = moment(
        todayStart.format("YYYY-MM-DD") + " " + room.closingTime
      );
      const slotDuration = 30;
      const allSlots = [];
      let current = opening.clone();
      while (current.add(slotDuration, "minutes").isSameOrBefore(closing)) {
        const slotStart = current.clone().subtract(slotDuration, "minutes");
        const slotEnd = current.clone();

        allSlots.push({
          start: slotStart.format("HH:mm"),
          end: slotEnd.format("HH:mm"),
        });
      }
      console.log("All Slots", allSlots.length);
      const availableSlots = allSlots.filter((slot) => {
        const slotStartTime = moment(
          todayStart.format("YYYY-MM-DD") + " " + slot.start
        );
        const slotEndTime = moment(
          todayStart.format("YYYY-MM-DD") + " " + slot.end
        );

        const overlaps = bookingsToday.some((booking) => {
          const bookingStart = moment(
            todayStart.format("YYYY-MM-DD") + " " + booking.startTime
          );
          const bookingEnd = moment(
            todayStart.format("YYYY-MM-DD") + " " + booking.endTime
          );

          return (
            slotStartTime.isBefore(bookingEnd) &&
            slotEndTime.isAfter(bookingStart)
          );
        });
        return !overlaps;
      });

      console.log("Available Slots:", availableSlots.length);
      const roomData = room.toJSON();
      delete roomData.Bookings;

      return {
        ...roomData,
        availableSlotsCount: availableSlots.length,
      };
    });

    if (!rooms || rooms.length === 0) {
      throw new AppError(
        "No Meeting Room found for the given Location",
        StatusCodes.NOT_FOUND
      );
    }

    return roomsWithSlots;
  } catch (error) {
    console.log(error);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Failed to fetch Meeting Rooms by Location ID",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
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
  addMeetingRoomCredits,
  getRoomsByLocationId,
};
