const { StatusCodes } = require('http-status-codes');
const dashboardRepo = require('../repositories/dashboard-repository');
const AppError = require('../utils/error/app-error');

/// Get dashboard summary — stat cards + occupancy chart
async function getDashboardSummary() {
  try {
    const summary = await dashboardRepo.getDashboardSummary();
    return summary;
  } catch (error) {
    console.log('Error in Dashboard Service: getDashboardSummary', error);
    if (error.name == 'SequelizeValidationError') {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        'Unable to fetch dashboard summary',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

/// Get today's bookings (paginated)
async function getTodaysBookings(limit, offset) {
  try {
    const result = await dashboardRepo.getTodaysBookings(limit, offset);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getTodaysBookings', error);
    if (error.name == 'SequelizeValidationError') {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        'Unable to fetch today\'s bookings',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

/// Get low wallet balance alerts (paginated)
async function getWalletAlerts(limit, offset, threshold) {
  try {
    const result = await dashboardRepo.getWalletAlerts(limit, offset, threshold);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getWalletAlerts', error);
    if (error.name == 'SequelizeValidationError') {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        'Unable to fetch wallet alerts',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

/// Get recently added companies (paginated)
async function getRecentCompanies(limit, offset) {
  try {
    const result = await dashboardRepo.getRecentCompanies(limit, offset);
    return result;
  } catch (error) {
    console.log('Error in Dashboard Service: getRecentCompanies', error);
    if (error.name == 'SequelizeValidationError') {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        'Unable to fetch recent companies',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

module.exports = {
  getDashboardSummary,
  getTodaysBookings,
  getWalletAlerts,
  getRecentCompanies
};
