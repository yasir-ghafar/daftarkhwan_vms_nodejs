const { StatusCodes } = require('http-status-codes');
const { CompanyService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common');
const company = require('../models/company');


async function createCompany(req, res) {
    try {
        console.log(req.body);
        const company  = await CompanyService.createCompany({
            name: req.body.name,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            businessType: req.body.businessType,
            websiteUrl: req.body.websiteUrl,
            reference: req.body.reference,
            cin: req.body.cin,
            pan: req.body.pan,
            gstn: req.body.gstn,
            tan: req.body.tan,
            billingAddress: req.body.billingAddress,
            LocationId: req.body.LocationId
        });
        SuccessResponse.data = company;
        return res
            .status(StatusCodes.CREATED)
            .json(SuccessResponse);

    } catch(error) {
        console.log(`Error in controller: ${error}`)
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function getCompanies(req, res) {
    try {
        const companies = await CompanyService.getAllCompanies();
        SuccessResponse.data = companies;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}

module.exports = {
    createCompany,
    getCompanies
}