const { Wallet, WalletTransaction, Activity, User, sequelize} = require('../models');
const { Op, where } = require('sequelize'); 


async function logActivity(params, transaction) {
    const {
        userId,
        action,
        targetId = null,
        targetType = null,
        metadata = {},
        performedBy = null
    } = params;

    console.log(`Logging activity: ${action} for user ${userId}`);

    return await Activity.create(
        {
            userId,
            action,
            targetId,
            targetType,
            metadata,
            performedBy
        },
        { transaction }
    );
}

async function getUserActivities(userId) {
    return await Activity.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
    });
}


async function getAllActivities(filter = {}) {
    return await Activity.findAll({
        where: filter,
        order: [['createdAt', 'DESC']],
    });
}

async function getUserActivitiesDetailed(userId) {
    console.log("User Id in repo: ",userId)
  return await Activity.findAll({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user', // target user
        attributes: ['id', 'name', 'email', 'role']
      },
      {
        model: User,
        as: 'performedByUser', // performer
        attributes: ['id', 'name', 'email', 'role']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}

async function getUserActivityDetailsByDate(userId, startDate, endDate, targetType = 'MeetingRoomBooking') {

  console.log("User Id in repo: ", userId);
  
  const whereClause = { 
    userId,
    targetType
  };
  
  // Filter by metadata.date range if provided
  if (startDate && endDate) {
    // Add JSON filtering for the date in metadata
    whereClause['metadata.date'] = {
      [Op.between]: [startDate, endDate]
    };
  }

  return await Activity.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      },
      {
        model: User,
        as: 'performedByUser',
        attributes: ['id', 'name', 'email', 'role']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}


module.exports = {
    logActivity,
    getUserActivities,
    getAllActivities,
    getUserActivitiesDetailed,
    getUserActivityDetailsByDate
}

