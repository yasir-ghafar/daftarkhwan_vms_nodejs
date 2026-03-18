const { Wallet, WalletTransaction, Company, CompanyWallet  } = require('../models');
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

    if (Number(wallet.monthly_credits) === 0) {
        wallet.monthly_credits = Number(wallet.monthly_credits) + Number(updates.meeting_room_credits)
    }

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

/// this method will get all the wallets available and one by one 
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


async function getCompanyWalletByCompanyId(companyId, transaction) {
  if (!companyId) {
    throw new Error('companyId is required');
  }

  return CompanyWallet.findOne({
    where: { company_id: companyId },
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });
}


/// update company wallet balance
async function updateCompanyWalletBalance(wallet, amount, transaction) {
    console.log(`Wallet Amount to be deducted. ${amount}`);
    console.log(`Wallet: ${wallet.id}`);
    console.log(`Monthly Room Credits Available: ${wallet.meeting_room_credits}`);
    wallet.meeting_room_credits = Number(wallet.meeting_room_credits) + Number(amount);
    await wallet.save({transaction});
}


module.exports = {
    updateWalletBalance,
    logWalletTransaction,
    updatewalletCredits,
    getWalletTransactions,
    resetAllWalletBalances,
    getCompanyWalletByCompanyId,
    updateCompanyWalletBalance
}