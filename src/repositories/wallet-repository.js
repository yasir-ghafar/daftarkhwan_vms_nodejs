const { Wallet, WalletTransaction } = require('../models');
const CrudRepository = require('./crud-repository');

async function updateWalletBalance(wallet, amount, transaction) {
    console.log(`Wallet Amount to be deducted. ${amount}`);
    wallet.meeting_room_credits = Number(wallet.meeting_room_credits) + Number(amount);
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

async function updatewalletCredits(walletId, updates, transaction) {

    console.log(walletId);
    console.log("updates", updates)
    const wallet = await Wallet.findByPk(walletId, { transaction});

    if (!wallet) throw new Error(`Wallet with ID ${walletId} not found`);

    if (typeof updates.meeting_room_credits !== 'undefined') {
        wallet.meeting_room_credits = Number(wallet.meeting_room_credits) + Number(updates.meeting_room_credits);
    }

    if (typeof updates.printing_credits !== 'undefined') {
        wallet.printing_credits = Number(wallet.printing_credits) + Number(updates.printing_credits);
    }

    await wallet.save({ transaction });
    return wallet;
}


async function getWalletTransactions(walletId, ) {
    

    const transactions = await WalletTransaction.findAll({
        where: { wallet_id: walletId },
        order: [['createdAt', 'DESC']], // default: latest first
    });

    return transactions;
}

module.exports = {
    updateWalletBalance,
    logWalletTransaction,
    updatewalletCredits,
    getWalletTransactions
}