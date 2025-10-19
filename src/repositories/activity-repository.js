const { Wallet, WalletTransaction, Activity, User } = require('../models');

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


module.exports = {
    logActivity,
    getUserActivities,
    getAllActivities,
    getUserActivitiesDetailed
}

