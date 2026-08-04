const { StatusCodes } = require("http-status-codes");
const { LoungeRepository } = require('../repositories');
const AppError = require("../utils/error/app-error");


const loungeRepository = new LoungeRepository();


async function createLounge(data) {
    try {
        const lounge = await loungeRepository.create(data);
        const 
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

module.exports = {
    createLounge
}