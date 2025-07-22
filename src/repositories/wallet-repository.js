const { Wallet, WalletTransaction } = require('../models');
const CrudRepository = require('./crud-repository');

async function updateWalletBalance(wallet, amount, transaction) {
    console.log(`Wallet Amount to be deducted. ${amount}`);
    wallet.balance = Number(wallet.balance) + Number(amount);
    await wallet.save({transaction});
}

async function logWalletTransaction(walletId, type, amount, reason, transaction) {
    return await WalletTransaction.create({
        wallet_id: walletId,
        type: type,
        amount: amount,
        reason: reason
    }, { transaction });
}

module.exports = {
    updateWalletBalance,
    logWalletTransaction
}