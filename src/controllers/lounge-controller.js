const { StatusCodes } = require('http-status-codes');
const { LaoungeService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { json } = require('sequelize');
const moment = require('moment');
const { getFilename } = require('../utils/file-manager');


async function createLounge(req, res) {
    const { body, file} = req;

    console.log("LOUNGE_BODY", body);
    try {
        openingTime = moment(req.body.openingTime, "hh:mm:ss A").format("HH:mm:ss");
        closingTime = moment(req.body.closingTime, "hh:mm:ss A").format("HH:mm:ss");
        const lounge = await LaoungeService.createLounge({
            name: req.body.name,
            creditsPerSlot: req.body.creditsPerSlot,
            capacity: req.body.capacity,
            openingTime: openingTime,
            closingTime: closingTime,
            floor: req.body.floor,
            locationId: req.body.locationId,
            amenitie: req.body.amenitie,
            availableDays: req.body.availableDays,
            status: req.body.status,
            image: null
            //image: fild ? getFilename(file.path) : null
        });

        SuccessResponse.data = lounge;
        return res
            .status(StatusCodes.CREATED)
            .json(SuccessResponse)

    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
    
}


async function getAllLounges(req, res) {
    try {
        console.log('Get All Lounges');
        const lounges = await LaoungeService.getAllLounges();
        SuccessResponse.data = lounges;
        SuccessResponse.message = "Lounges Fetched Successfully."
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(error.StatusCodes)
            .json(ErrorResponse)
    }
}


module.exports = {
    createLounge,
    getAllLounges
}