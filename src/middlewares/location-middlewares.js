const { StatusCodes } = require("http-status-codes");

const { ErrorResponse } = require('../utils/common');

function validateCreateLocationRequest(req, res, next) {
    if (!req.body.name) {
        ErrorResponse.message = 'Something went wrong while creating Location'
        ErrorResponse.error = {explanation: 'Name Cannot be null'}
        return res.status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    next();
}


module.exports = {
    validateCreateLocationRequest
}