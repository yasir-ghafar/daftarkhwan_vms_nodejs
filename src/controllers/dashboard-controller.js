const { StatusCodes } = require('http-status-codes');
const dashboardService = require('../services/dashboard-service');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

/// GET /dashboard/summary
/// All stat cards + occupancy chart
async function getDashboardSummary(req, res) {
    console.log('getting in controller: getDashboardSummary');
    try {
        const summary = await dashboardService.getDashboardSummary();

        SuccessResponse.data = summary;
        SuccessResponse.message = 'Dashboard summary fetched successfully';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong while fetching dashboard summary.';
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

/// GET /dashboard/bookings/today
/// Today's bookings list, paginated
async function getTodaysBookings(req, res) {
    console.log('getting in controller: getTodaysBookings');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        console.log(`req params: ${page} and ${limit}`);

        const bookings = await dashboardService.getTodaysBookings(limit, offset);

        SuccessResponse.data = bookings;
        SuccessResponse.message = 'Today\'s bookings fetched successfully';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong while fetching today\'s bookings.';
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

/// GET /dashboard/wallet-alerts
/// Low wallet balance users, paginated
async function getWalletAlerts(req, res) {
    console.log('getting in controller: getWalletAlerts');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let threshold;
        if (req.query.threshold !== undefined) {
            const parsed = parseFloat(req.query.threshold);
            if (!Number.isNaN(parsed)) {
                threshold = parsed;
            }
        }
        console.log(`req params: ${page}, ${limit}, threshold: ${threshold}`);

        const alerts = await dashboardService.getWalletAlerts(limit, offset, threshold);

        SuccessResponse.data = alerts;
        SuccessResponse.message = 'Wallet alerts fetched successfully';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong while fetching wallet alerts.';
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

/// GET /dashboard/companies/recent
/// Recently added companies, paginated
async function getRecentCompanies(req, res) {
    console.log('getting in controller: getRecentCompanies');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        console.log(`req params: ${page} and ${limit}`);

        const companies = await dashboardService.getRecentCompanies(limit, offset);

        SuccessResponse.data = companies;
        SuccessResponse.message = 'Recent companies fetched successfully';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong while fetching recent companies.';
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

module.exports = {
    getDashboardSummary,
    getTodaysBookings,
    getWalletAlerts,
    getRecentCompanies
};
