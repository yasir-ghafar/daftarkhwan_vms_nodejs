const { StatusCodes } = require("http-status-codes");
const { MeetingRoomRepository, AmenityRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");
const { Location, Booking, User, Company } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");
const { getFileUrl } = require("../utils/file-manager");

const meetingRoomRepository = new MeetingRoomRepository();
const amenityRepository = new AmenityRepository();

async function createMeetingRoom(data) {
  console.log("Create Meeting Room method is called in service.");
  try {
    const meetinRoom = await meetingRoomRepository.create(data);
    const updatedRoomData = formatRoom(meetinRoom);
    return updatedRoomData;
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

// Helper function to format meeting room with image URL
function formatRoom(room) {
  if (!room) return null;

  const roomData = room.toJSON ? room.toJSON() : room;
  console.log("Room Data:", roomData);

  try {
    // if image is stored as just a filename, convert to full URL
    if (roomData.image && !roomData.image.includes('://')) {
      console.log("Creating URL for image:", roomData.image);
      roomData.imageUrl = getFileUrl(roomData.image, 'rooms');
      console.log("Image URL created:", roomData.imageUrl);
    } else if (roomData.image) {
      console.log("Image is already a URL");
      roomData.imageUrl = roomData.image;
    }
  } catch (error) {
    console.log(error);
  }

  console.log("Returning formateed room object.");
  return roomData;
}


async function getMeetingRoomById(id) {
  try {
    const room = await meetingRoomRepository.getWithOptions(id, {
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

    if (!room) {
      throw new AppError("Meeting Room Not Found", StatusCodes.NOT_FOUND);
    }

    // Convert Sequelize instance to plain object
    const roomData = room.toJSON();

    // Calculate slots
    const { availableSlots, availableSlotsCount } = calculateAvailableSlots(
      roomData,
      roomData.Bookings
    );

    // Remove Bookings to clean up the response
    delete roomData.Bookings;

    return {
      ...roomData,
      availableSlots,
      availableSlotsCount,
    };
  } catch (error) {
    //console.log("Error in service: ", error);
    console.log("Error name in service: ", error.name);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Unable to Fetch Meeting Room",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
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

async function updateMeetingRoom(id, data) {
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
      where: {
        LocationId: locationId,
        status: {
          [Op.or]: ["active", "Active"],
        },
      },
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

    // Defensive check for null, undefined, or empty result
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new AppError("No Meeting Room found for the given Location", StatusCodes.NOT_FOUND);
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
    console.error("getRoomsByLocationId error:", error);

    if (error instanceof AppError) {
      throw error; // Re-throw known errors as-is
    }

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


async function getMeetingRoomWithStatus(id) {
  try {
    const room = await meetingRoomRepository.getWithOptions(id, {
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"], // keep id for consistency
        },
        {
          model: Booking,
          as: "Bookings",
          required: false,
          include: [
            {
              model: User,
              as: "User",
              attributes: ["id", "name"],
              include: [
                {
                  model: Company,
                  as: "Company",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!room)
      throw new AppError("Meeting Room Not Found", StatusCodes.NOT_FOUND);

    const roomData = room.toJSON();
    const today = moment().format("YYYY-MM-DD");

    // Filter only today's bookings
    const bookingsToday = roomData.Bookings.filter((b) => b.date === today);

    // Calculate availability
    const { availableSlots, availableSlotsCount } = calculateAvailableSlots(
      roomData,
      bookingsToday
    );

    delete roomData.Bookings;

    return {
      ...roomData,
      bookingsToday, // explicit
      availableSlots,
      availableSlotsCount,
    };
  } catch (error) {
    //console.log("Error in service: ", error);
    console.log("Error name in service: ", error.name);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Unable to Fetch Meeting Room",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}


// Method ot get meeting room availability by date 
async function getMeetingRoomAvailabilityByDate(id, date) {
  try {
    const room = await meetingRoomRepository.getWithOptions(id, {
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["name"],
        },
        {
          model: Booking,
          required: false,
          where: { date }, // Only bookings for the requested date
          attributes: ["id", "date", "startTime", "endTime", "status"], // <-- include status
        },
      ],
    });

    if (!room) {
      throw new AppError("Meeting Room Not Found", StatusCodes.NOT_FOUND);
    }

    const roomData = room.toJSON();

    const { availableSlots, availableSlotsCount } = calculateAvailableSlots(
      roomData,
      roomData.Bookings,
      date
    );

    delete roomData.Bookings;

    return {
      ...roomData,
      date,
      availableSlots,
      availableSlotsCount,
    };
  } catch (error) {
    console.error("In service: ", error);

    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError("Unable to Fetch Meeting Room Availability", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


function calculateAvailableSlots(room, bookings = [], date = null) {
  // Use given date or fallback to today
  const targetDate = date
    ? moment(date, "YYYY-MM-DD").format("YYYY-MM-DD")
    : moment().format("YYYY-MM-DD");

  console.log(`Target date:`, targetDate);

  // Build opening/closing times for the target date
  const openingTime = moment(`${targetDate} ${room.openingTime}`, "YYYY-MM-DD hh:mm:ss A");
  const closingTime = moment(`${targetDate} ${room.closingTime}`, "YYYY-MM-DD hh:mm:ss A");

  if (!openingTime.isValid() || !closingTime.isValid() || openingTime.isSameOrAfter(closingTime)) {
    return { availableSlots: [], availableSlotsCount: 0 };
  }

  const SLOT_DURATION_MINUTES = room.duration;
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


  const activeBookings = bookings.filter(
    b => b.date === targetDate && b.status !== "cancelled"
  );

  const availableSlots = slots.filter(slot => {
    const slotStartTime = moment(`${targetDate} ${slot.start}`, "YYYY-MM-DD HH:mm");
    const slotEndTime = moment(`${targetDate} ${slot.end}`, "YYYY-MM-DD HH:mm");

    return !activeBookings.some(booking => {
      const bookingStart = moment(`${targetDate} ${booking.startTime}`, "YYYY-MM-DD HH:mm");
      const bookingEnd = moment(`${targetDate} ${booking.endTime}`, "YYYY-MM-DD HH:mm");

      return slotStartTime.isBefore(bookingEnd) && slotEndTime.isAfter(bookingStart);
    });
  });

  console.log("Available Slots:", availableSlots.length);
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
  updateMeetingRoom,
  getRoomsByLocationId,
  getMeetingRoomWithStatus,
  getMeetingRoomAvailabilityByDate
};
