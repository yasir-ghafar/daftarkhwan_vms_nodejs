const { sequelize } = require('../models');
const walletRepository = require('../repositories/wallet-repository');

async function resetAllWalletBalancesService() {
    const transaction = await sequelize.transaction();
    try {
        console.log('🔁 Starting full wallet balance reset...');
        const wallets = await walletRepository.resetAllWalletBalances(transaction);
        await transaction.commit();
        console.log(`✅ Successfully reset ${wallets.length} wallet balances`);
        return wallets;
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Failed to reset all wallet balances:', error.message);
        throw error;
    }
}


async function checkAndUpdateMonthlyBalance(walletId, credits) {
    const transaction = await sequelize.transaction();
    try {
        console.log(`reached in Service with wallet id: ${walletId} and new Meeting Room Credits: ${credits}`);
        const wallet = await walletRepository.updateMonthlyCredits(walletId, credits, transaction);
        await transaction.commit();
        return wallet;
    } catch(error) {
        await transaction.rollback();
        console.error('❌ Unable to fetch wallet:', error.message);
        throw error;
    }
}

module.exports = {
    resetAllWalletBalancesService,
    checkAndUpdateMonthlyBalance
};
