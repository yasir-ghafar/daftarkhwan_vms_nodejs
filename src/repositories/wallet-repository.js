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


// async function getAllWallets(transaction) {
//     console.log('Fetching all wallets');

//     const wallets = await Wallet.findAll({
//         include: [
//             {
//                 association: 'User', // optional — only works if you defined Wallet.belongsTo(models.User)
//                 attributes: ['id', 'name', 'email'] // include basic user details if you want
//             }
//         ],
//         order: [['createdAt', 'DESC']], // latest first
//         transaction
//     });

//     return wallets;
// }


// async function resetWalletBalance(walletId, transaction) {
//     console.log(`Resetting wallet balance for wallet ID: ${walletId}`);

//     // Fetch wallet in transaction scope
//     const wallet = await Wallet.findByPk(walletId, { transaction });
//     if (!wallet) throw new Error(`Wallet with ID ${walletId} not found`);

//     // Reset meeting room credits to monthly credits value
//     wallet.meeting_room_credits = Number(wallet.monthly_credits) || 0;

//     // Save the updated wallet
//     await wallet.save({ transaction });

//     // Log the transaction (optional, for audit trail)
//     await WalletTransaction.create({
//         wallet_id: wallet.id,
//         type: 'RESET',
//         amount: wallet.meeting_room_credits,
//         reason: 'Monthly meeting room credits reset',
//     }, { transaction });

//     console.log(`Wallet ${walletId} reset successfully.`);
//     return wallet;
// }


/// this method will get all the wallets available and one by one will 
async function resetAllWalletBalances(transaction) {
    console.log('Starting reset for all wallet balances');

    // Fetch all wallets in transaction scope
    const wallets = await Wallet.findAll({ transaction });
    if (!wallets || wallets.length === 0) {
        console.log('No wallets found to reset');
        return [];
    }

    // Loop through and reset each wallet
    for (const wallet of wallets) {
        if (wallet.auto_renewal === 1) {
            console.log("Monthly Credit:", wallet.monthly_credits);
            console.log("Meeting Room Credit before rest:", wallet.meeting_room_credits);
            wallet.meeting_room_credits = wallet.monthly_credits || 0.0;
        await wallet.save({ transaction });

        // Log each wallet reset as a transaction entry (optional but recommended)
        await WalletTransaction.create({
            wallet_id: wallet.id,
            type: 'RESET',
            amount: wallet.meeting_room_credits,
            reason: 'Monthly meeting room credits reset.',
        }, { transaction });
        }
        
    }

    console.log(`Successfully reset ${wallets.length} wallet balances`);
    return wallets;
}




module.exports = {
    updateWalletBalance,
    logWalletTransaction,
    updatewalletCredits,
    getWalletTransactions,
    resetAllWalletBalances
}