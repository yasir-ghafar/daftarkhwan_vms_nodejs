const { StatusCodes } = require("http-status-codes");
const { LoungeRepository } = require('../repositories');
const { Location, Booking, User, Company } = require("../models");
const AppError = require("../utils/error/app-error");
const { cast } = require("sequelize");
const { success } = require("../utils/common/error-response");


const loungeRepository = new LoungeRepository();


async function createLounge(data) {
    try {
        const lounge = await loungeRepository.create(data);
        return lounge;
    } catch (error) {
        if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Lounge",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
    }
}

async function getLoungeById(id) {
    try {
        const lounge = await loungeRepository.getWithOptions(id, {
            include: [
                {
                    model: Lounge,
                    as: "location",
                    attributes: ["name"],
                },
                {
                    model: Booking,
                    required: false,
                },
            ],
        });

        if (!lounge) {
            throw new AppError("Lounge Not Found", StatusCodes.NOT_FOUND);
        }

        const loungeData = lounge.toJSON();

    } catch(error) {

    }
}

async function getAllLounges() {
    try {
        const lounges = await loungeRepository.getAll({
            include: [
                {
                    model: Location,
                    as: "location",
                    attributes: ["name"],
                },
            ]
        })

        return lounges;
    } catch(error) {
        console.error(error);
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      throw new AppError(messages.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw new AppError(
      "Unable to Fetch Lounges",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    }
}

async function udpateLounge(id, data) {
    try {
        const lounge = await loungeRepository.update(id, data);
        return lounge;
    } catch(error) {
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

async function deleteLounge(id) {
    try {
        const lounge = await loungeRepository.get(id);

        if (!lounge) {
            throw new AppError("Lounge Not Foud.", StatusCodes.NOT_FOUND);
        }

        const isDeleted = await loungeRepository.destroy(id);

        if (!isDeleted) {
            throw new AppError(
                "Failed to delete the Lounge.",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }

        return {
            success: true,
            message: "Lounge Deleted Successfully.",
            data: null,
        };
    } catch(error) {
        console.error(`Error in Service: ${error}`);

        if (error.name === "SequelizeValidationError") {
            const explanation = error.errors.map((err) => err.message);
            throw new AppError(explanation.join(", "), StatusCodes.BAD_REQUEST);
        }

        throw error;
    } 
}
module.exports = {
    createLounge,
    getAllLounges,
    deleteLounge,
    udpateLounge
}