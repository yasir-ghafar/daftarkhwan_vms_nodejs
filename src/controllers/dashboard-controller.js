const { StatusCodes } = require('http-status-codes');
const dashboardService = require('../services/dashboard-service');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

function parsePageLimit(query, defaultLimit = 10) {
    const parsedPage = parseInt(query.page, 10);
    const parsedLimit = parseInt(query.limit, 10);

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit)
        ? Math.min(100, Math.max(1, parsedLimit))
        : defaultLimit;

    return {
        page,
        limit,
        offset: (page - 1) * limit
    };
}

function parseLocationId(query) {
    if (query.location_id === undefined || query.location_id === null || query.location_id === '') {
        return undefined;
    }

    const parsed = parseInt(query.location_id, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        const error = new Error('location_id must be a positive integer');
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return parsed;
}

/// GET /dashboard/summary
/// All stat cards + occupancy chart
async function getDashboardSummary(req, res) {
    console.log('getting in controller: getDashboardSummary');
    try {
        const locationId = parseLocationId(req.query);
        console.log(`location_id: ${locationId}`);

        const summary = await dashboardService.getDashboardSummary(locationId);

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
        const { page, limit, offset } = parsePageLimit(req.query, 10);
        const locationId = parseLocationId(req.query);
        console.log(`req params: ${page}, ${limit}, location_id: ${locationId}`);

        const bookings = await dashboardService.getTodaysBookings(limit, offset, locationId);

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

/// GET /dashboard/bookings/upcoming
/// Next bookings from call time (Ongoing + Upcoming), default limit 10
async function getUpcomingBookings(req, res) {
    console.log('getting in controller: getUpcomingBookings');
    try {
        const { limit } = parsePageLimit(req.query, 10);
        const locationId = parseLocationId(req.query);
        console.log(`req params: limit=${limit}, location_id: ${locationId}`);

        const bookings = await dashboardService.getUpcomingBookings(limit, locationId);

        SuccessResponse.data = bookings;
        SuccessResponse.message = 'Upcoming bookings fetched successfully';
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        console.log(`Error: ${error}`);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong while fetching upcoming bookings.';
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
        const { page, limit, offset } = parsePageLimit(req.query, 10);
        const locationId = parseLocationId(req.query);
        let threshold;
        if (req.query.threshold !== undefined) {
            const parsed = parseFloat(req.query.threshold);
            if (!Number.isNaN(parsed)) {
                threshold = parsed;
            }
        }
        console.log(`req params: ${page}, ${limit}, threshold: ${threshold}, location_id: ${locationId}`);

        const alerts = await dashboardService.getWalletAlerts(limit, offset, threshold, locationId);

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
        const { page, limit, offset } = parsePageLimit(req.query, 10);
        const locationId = parseLocationId(req.query);
        console.log(`req params: ${page}, ${limit}, location_id: ${locationId}`);

        const companies = await dashboardService.getRecentCompanies(limit, offset, locationId);

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
    getUpcomingBookings,
    getWalletAlerts,
    getRecentCompanies
};
