const { StatusCodes } = require('http-status-codes');
const { LaoungeService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { json } = require('sequelize');
const moment = require('moment');


async function createLounge(req, res) {
    const { body, file} = req;

    try {
        openingTime = moment(req.body.openingTime, "hh:mm:ss A").format("HH:mm:ss");
        closingTime = moment(req.body.closingTime, "hh:mm:ss A").format("HH:mm:ss");

    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
    
}