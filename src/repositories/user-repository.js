const { User, Wallet, Company, Location, CompanyWallet  } = require('../models');

const { Logger } = require('../config');


async function getUserWithWallet(userId, transaction) {
  console.log('User Id in User Repo: ', userId);
    return await User.findByPk(userId, {
  include: [

    {
      model: Company,
      attributes: ['id', 'name'],
      include: [
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name']
        }
      ]
    }
  ],
  transaction,
  lock: transaction.LOCK.UPDATE
});

}

async function loginUser(userEmail) {
  console.log(`Login email: ${userEmail}`);
  try {
    const response = await User.findOne({
      where: {
        email: userEmail
      },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
          include: [
            {
              model: CompanyWallet,
              attributes: ['id', 'meeting_room_credits']
            },
          ]
        }
      ]
    });
    return response;
  } catch(error) {
    Logger.error('Somthing went wrong in User Repo: findOne');
    throw error;
  }
}

module.exports = { 
  getUserWithWallet,
  loginUser
 }; 