const express = require('express');
const { DashboardController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

/// Dashboard summary — stat cards + occupancy chart
router.get('/summary',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager'),
    DashboardController.getDashboardSummary);

/// Today's bookings (paginated)
router.get('/bookings/today',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager'),
    DashboardController.getTodaysBookings);

/// Low wallet balance alerts (paginated)
router.get('/wallet-alerts',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager'),
    DashboardController.getWalletAlerts);

/// Recently added companies (paginated)
router.get('/companies/recent',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager'),
    DashboardController.getRecentCompanies);

module.exports = router;
