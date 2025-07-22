const { StatusCodes } = require('http-status-codes');
const { LocationService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common')

/**
 * POST : /locations
 * @param {*} req 
 * @param {*} res 
 */

async function createLocation(req, res) {
    try {
        console.log(req.body);
        const location = await LocationService.createLocation({
            name: req.body.name,
            seatingCapacity: req.body.seatingCapacity,
            area: req.body.area,
            contactNumber: req.body.contactNumber,
            email: req.body.email,
            businessStartTime: req.body.businessStartTime,
            businessEndTime: req.body.businessEndTime,
            legalBusinessName: req.body.legalBusinessName,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
        });
        SuccessResponse.data = location;

        return res.status(StatusCodes.CREATED)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
}

async function getLocations(req, res) {
    try {
        const locations = await LocationService.getAllLocations();
        SuccessResponse.data = locations;
        SuccessResponse.message = 'Locations Fetched Successfully!'
        return res.status(StatusCodes.OK)
        .json(SuccessResponse)
    } catch(error) {
            ErrorResponse.error = error;
            return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

async function getLocationById(req, res) {
    
}
module.exports = {
    createLocation,
    getLocations
} 