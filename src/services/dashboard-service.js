const { StatusCodes } = require('http-status-codes');
const { Location } = require('../models');
const dashboardRepo = require('../repositories/dashboard-repository');
const AppError = require('../utils/error/app-error');

async function assertLocationExists(locationId) {
  if (locationId === undefined || locationId === null) {
    return;
  }

  const location = await Location.findByPk(locationId);
  if (!location) {
    throw new AppError('Location not found', StatusCodes.NOT_FOUND);
  }
}

function handleSequelizeValidation(error, message) {
  if (error.name == 'SequelizeValidationError') {
    let explanation = [];
    (error.errors || []).forEach((err) => {
      explanation.push(err.message);
    });
    console.log(explanation);
    throw new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/// Get dashboard summary — stat cards + occupancy chart
async function getDashboardSummary(locationId) {
  try {
    await assertLocationExists(locationId);
    const summary = await dashboardRepo.getDashboardSummary(locationId);
    return summary;
  } catch (error) {
    console.log('Error in Dashboard Service: getDashboardSummary', error);
    handleSequelizeValidation(error, 'Unable to fetch dashboard summary');
    throw error;
  }
}

/// Get today's bookings (paginated)
async function getTodaysBookings(limit, offset, locationId) {
  try {
    await assertLocationExists(locationId);
    const result = await dashboardRepo.getTodaysBookings(limit, offset, locationId);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getTodaysBookings', error);
    handleSequelizeValidation(error, 'Unable to fetch today\'s bookings');
    throw error;
  }
}

/// Get upcoming bookings from call time (Ongoing + Upcoming)
async function getUpcomingBookings(limit, locationId) {
  try {
    await assertLocationExists(locationId);
    const result = await dashboardRepo.getUpcomingBookings(limit, locationId);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getUpcomingBookings', error);
    handleSequelizeValidation(error, 'Unable to fetch upcoming bookings');
    throw error;
  }
}

/// Get low wallet balance alerts (paginated)
async function getWalletAlerts(limit, offset, threshold, locationId) {
  try {
    await assertLocationExists(locationId);
    const result = await dashboardRepo.getWalletAlerts(limit, offset, threshold, locationId);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getWalletAlerts', error);
    handleSequelizeValidation(error, 'Unable to fetch wallet alerts');
    throw error;
  }
}

/// Get recently added companies (paginated)
async function getRecentCompanies(limit, offset, locationId) {
  try {
    await assertLocationExists(locationId);
    const result = await dashboardRepo.getRecentCompanies(limit, offset, locationId);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getRecentCompanies', error);
    handleSequelizeValidation(error, 'Unable to fetch recent companies');
    throw error;
  }
}

module.exports = {
  getDashboardSummary,
  getTodaysBookings,
  getUpcomingBookings,
  getWalletAlerts,
  getRecentCompanies
};
