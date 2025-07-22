const { User, Wallet  } = require('../models');

async function getUserWithWallet(userId, transaction) {
    return await User.findByPk(userId, {
        include: Wallet,
        transaction,
        lock: transaction.LOCK.UPDATE
    });
}

module.exports = { getUserWithWallet };