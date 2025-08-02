const { StatusCodes } = require("http-status-codes");
const { LocationRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");

const { MeetingRoom } = require("../models");

const locationRepository = new LocationRepository();

async function createLocation(data) {
  try {
    console.log(` Console in Service: ${data}`);
    const location = await locationRepository.create(data);
    return location;
  } catch (error) {
    console.log(` Error in Service: ${error}`);
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Location",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}


async function updateLocation(id, data) {
  try {
    console.log("logged in service",)
    const location = await locationRepository.get(id);

    if (!location) {
      throw new AppError('Location not found', StatusCodes.NOT_FOUND);
    }

    const updatedLocation = await locationRepository.update(data);
    return updatedLocation;
  } catch (error) {
    console.log(`Error in updateLocation Service: ${error}`);
    if (error.name === 'SequelizeValidationError') {
      const explanation = error.errors.map((err) => err.message);
      console.log(explanation);
      throw new AppError('Validation failed', StatusCodes.BAD_REQUEST);
    }
    throw error;
  }
}

async function getLocationById(id) {
  try {
    const location = await locationRepository.get(id);
    //console.log(location);
    if (!location) {
      throw new AppError("Location not found.", StatusCodes.NOT_FOUND);
    }

    console.log("returning object");
    return location;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Locations",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getAllLocations() {
  try {
    const locations = await locationRepository.getAll();
    return locations;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Location",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function deleteLocation(id) {
  try {
    const location = await locationRepository.get(id);

    if (!location) {
      throw new AppError("Location not found.", StatusCodes.NOT_FOUND);
    }

    // check if meeting room exists for this company
    const meetingRoomExists = await MeetingRoom.findOne({
      where: { LocationId: id },
    });

    if (meetingRoomExists) {
      throw new AppError(
        "Cannot delete Location. One or more meeting rooms are associated with it.",
        StatusCodes.CONFLICT
      );
    }

    const isDeleted = await locationRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError(
        "Failed to delete location",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      message: "Location deleted Successfully",
      data: null,
    };
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map((err) => err.message);
      throw new AppError(explanation.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

module.exports = {
  createLocation,
  getAllLocations,
  deleteLocation,
  getLocationById,
  updateLocation
};
