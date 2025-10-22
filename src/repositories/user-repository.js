const { User, Wallet, Company, Location  } = require('../models');

async function getUserWithWallet(userId, transaction) {
    return await User.findByPk(userId, {
  include: [
    {
      model: Wallet,
    },
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