const { StatusCodes } = require('http-status-codes');
const { CompanyService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common');
const company = require('../models/company');

const VALID_STATUSES = ['Active', 'Inactive', 'Suspended'];


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
            LocationId: req.body.LocationId,
            locationName: req.body.locationName,
            status: req.body.status
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

async function  getCompanyById(req, res) {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Company Id is required.'
            })
        }

        const company = await CompanyService.getCompanyById(id);

        SuccessResponse.data = company;

        return res.status(StatusCodes.OK)
            .json({SuccessResponse});
    } catch(error) {
        console.log(error);
        ErrorResponse.error = error;
        return res
            .status(error.statusCode)
            .json(ErrorResponse);
    }
}


async function deletCompany(req, res) {
    try {
        const {id} = req.body;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Company Id is required.'
            })
        }

        const response = await CompanyService.deleteCompany(id);

        return res.status(StatusCodes.OK).json(response);
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while deleting Company.'
            });
    }

}

async function updateCompanyStatus(req, res) {
    try {
        const {id, status } = req.body;
        console.log('Company Id:', id);
        console.log('Company Updated Status:', status);
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Company Id is required.'
            })
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Status is not valid.'
            })
        }

        const response = await CompanyService.updateCompanyStatus(id, status);

        SuccessResponse.message = 'Successfully Updated Company';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while updating Company.'
            });
    }
}


module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    deletCompany,
    updateCompanyStatus

}