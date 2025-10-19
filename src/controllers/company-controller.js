const { StatusCodes } = require('http-status-codes');
const { CompanyService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common');
const company = require('../models/company');

const VALID_STATUSES = ['Active', 'Inactive', 'Suspended'];

/// Create Company
async function createCompany(req, res) {
    try {
        console.log("Getting in controller")
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

/// Get All Companies
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

/// Get Companies by Location ID
async function getCompaniesByLocationId(req, res) {
    try {
        const { id } = req.params;

        if (!id ) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Location Id is required.'
            })
        }

        const companies = await CompanyService.getCompaniesByLocationId(id);

        SuccessResponse.data = companies;

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

/// Get Company by Company Id
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

/// Delete Company
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

/// Update Company Status
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


/// methods for wallet are created here
/// because in future their might b need to move wallet apis here


/// Update Wallet
async function updateWalletCredits(req, res) {

    
    const walletId = req.params.id;
    const { meeting_room_credits, printing_credits } = req.body;
    console.log("getting wallet with id:", walletId);
    try {
        const updatedWallet = await CompanyService.updateWalletCreditsService(walletId, {
            meeting_room_credits,
            printing_credits
        });
        
        SuccessResponse.data = updatedWallet;
        SuccessResponse.message = 'Successfully updated wallet';

        return res.status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while updating Company.'
            });
    }
}

async function getWalletTransactions(req, res) {
    console.log('getting here');
    const walletId = req.params.id;
    try {
        const transactions = await CompanyService.getWalletTransactionsById(walletId);
        
        SuccessResponse.data = transactions;
        SuccessResponse.message = 'Transactions Fetched Successfully';

        return res.status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while Fetching Transactions.'
            });
    }

}


async function getWalletTransactionsReport(req, res) {

    console.log(req.body);
    const userId = req.body.user_id;
    try {
        const records = await CompanyService.getWalletTransactionsReport(userId);
        SuccessResponse.data = records;
        SuccessResponse.message = "Successfully Fetched the Report"

        return res.status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while Fetching Transactions.'
            });
    }
    
}


module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    deletCompany,
    updateCompanyStatus,
    updateWalletCredits,
    getCompaniesByLocationId,
    getWalletTransactions,
    getWalletTransactionsReport

}