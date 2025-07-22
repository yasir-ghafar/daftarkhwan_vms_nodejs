const { StatusCodes } = require('http-status-codes');
const { MemberService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createMember(req, res) {
    try {
        console.log(req.body);
        const member = await MemberService.createMember({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            designation: req.body.designation,
            governmentId: req.body.governmentId,
            coWorkLocationId: req.body.coWorkLocationId,
            CompanyId: req.body.CompanyId,
            spocId: req.body.so
        });
        SuccessResponse.data = member;

        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        console.log(`Error in controller: ${error}`)
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    } 
}

async function getAllMembers(req, res) {
    try {
        const members = await MemberService.getAllMembers();
        SuccessResponse.data = members;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
            return res
                .status(error.StatusCodes)
                .json(ErrorResponse);
    }
}


module.exports = {
    createMember,
    getAllMembers
}