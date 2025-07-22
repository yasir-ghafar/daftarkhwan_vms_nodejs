const { StatusCodes } = require('http-status-codes');
const { LocationRepository } = require('../repositories');
const AppError = require('../utils/error/app-error')
const locationRepository = new LocationRepository();

async function createLocation(data) {
    try {
        const location = await locationRepository.create(data);
        return location;
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Cannot create a new Location', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function getLocationById(id) {
    try {
        const location = await locationRepository.get(id);
        return location
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Locations', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function getAllLocations() {
    try {
        const locations = await locationRepository.getAll();
        return locations
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Unable to Fetch Location', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
    
}

module.exports = {
    createLocation,
    getAllLocations
}