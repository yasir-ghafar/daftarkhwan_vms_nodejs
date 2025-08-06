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
          console.log("Create Meeting Room method is called in ser.");
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
        {
          model: Booking,
          required: false,
        },
      ],
    });

    const roomsWithSlots = rooms.map((room) => {
      const roomData = room.toJSON();
      const { availableSlotsCount } = calculateAvailableSlots(roomData, roomData.Bookings);

      delete roomData.Bookings;

      return {
        ...roomData,
        availableSlotsCount,
      };
    });

    return roomsWithSlots;
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Unable to Fetch Meeting Rooms",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
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
          required: false,
        },
      ],
    });

    if (!rooms || rooms.length === 0) {
      throw new AppError(
        "No Meeting Room found for the given Location",
        StatusCodes.NOT_FOUND
      );
    }

    const roomsWithSlots = rooms.map((room) => {
      const roomData = room.toJSON();
      const { availableSlotsCount } = calculateAvailableSlots(roomData, roomData.Bookings);

      delete roomData.Bookings;

      return {
        ...roomData,
        availableSlotsCount,
      };
    });

    return roomsWithSlots;
  } catch (error) {
    console.error(error);
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




// function calculateAvailableSlots(room, bookings) {
//   const today = moment().format("YYYY-MM-DD");
//   const todayStart = moment().startOf("day");

//   const opening = moment(`${today} ${room.openingTime}`);
//   const closing = moment(`${today} ${room.closingTime}`);

//   const slotDuration = 30; // minutes
//   const allSlots = [];
//   let current = opening.clone();

//   while (current.add(slotDuration, "minutes").isSameOrBefore(closing)) {
//     const slotStart = current.clone().subtract(slotDuration, "minutes");
//     const slotEnd = current.clone();

//     allSlots.push({
//       start: slotStart.format("HH:mm"),
//       end: slotEnd.format("HH:mm"),
//     });
//   }

//   const bookingsToday = (bookings || []).filter(
//     (booking) => booking.date === today
//   );

//   const availableSlots = allSlots.filter((slot) => {
//     const slotStartTime = moment(`${today} ${slot.start}`);
//     const slotEndTime = moment(`${today} ${slot.end}`);

//     return !bookingsToday.some((booking) => {
//       const bookingStart = moment(`${today} ${booking.startTime}`);
//       const bookingEnd = moment(`${today} ${booking.endTime}`);
//       return (
//         slotStartTime.isBefore(bookingEnd) &&
//         slotEndTime.isAfter(bookingStart)
//       );
//     });
//   });

//   return {
//     availableSlots,
//     availableSlotsCount: availableSlots.length,
//   };
// }

function calculateAvailableSlots(room, bookings = []) {
  const today = moment().format("YYYY-MM-DD");

  // Combine today's date with opening and closing times
  console.log(room.openingTime);
  console.log(room.closingTime);
  const openingTime = moment(`${today} ${room.openingTime}`, "YYYY-MM-DD hh:mm:ss A");
  const closingTime = moment(`${today} ${room.closingTime}`, "YYYY-MM-DD hh:mm:ss A");

  if (!openingTime.isValid() || !closingTime.isValid() || openingTime.isSameOrAfter(closingTime)) {
    return { availableSlots: [], availableSlotsCount: 0 };
  }

  const SLOT_DURATION_MINUTES = 30;
  const slots = [];

  let slotStart = openingTime.clone();

  while (slotStart.clone().add(SLOT_DURATION_MINUTES, "minutes").isSameOrBefore(closingTime)) {
    const slotEnd = slotStart.clone().add(SLOT_DURATION_MINUTES, "minutes");
    slots.push({
      start: slotStart.format("HH:mm"),
      end: slotEnd.format("HH:mm"),
    });
    slotStart = slotEnd;
  }

  const bookingsToday = bookings.filter(b => b.date === today);

  const availableSlots = slots.filter(slot => {
    const slotStartTime = moment(`${today} ${slot.start}`, "YYYY-MM-DD HH:mm");
    const slotEndTime = moment(`${today} ${slot.end}`, "YYYY-MM-DD HH:mm");

    return !bookingsToday.some(booking => {
      const bookingStart = moment(`${today} ${booking.startTime}`, "YYYY-MM-DD HH:mm");
      const bookingEnd = moment(`${today} ${booking.endTime}`, "YYYY-MM-DD HH:mm");

      // Check for overlap
      return slotStartTime.isBefore(bookingEnd) && slotEndTime.isAfter(bookingStart);
    });
  });

  return {
    availableSlots,
    availableSlotsCount: availableSlots.length,
  };
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
