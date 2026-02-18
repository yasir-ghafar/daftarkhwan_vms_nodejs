const { User, Wallet, Company, Location  } = require('../models');

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

module.exports = { getUserWithWallet };