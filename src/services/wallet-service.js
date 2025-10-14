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

module.exports = {
    resetAllWalletBalancesService
};
