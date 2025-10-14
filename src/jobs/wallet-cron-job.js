const { CronJob } = require('cron');
const { resetAllWalletBalancesService } = require('../services/wallet-service');


// 🔹 Run at midnight (00:00) on the 1st day of every month
const walletBalanceJob = new CronJob(
  '0 0 0 1 * *', // second, minute, hour, day, month, weekday
  async function () {
    console.log('CRON] Running monthly wallet balance reset job...');

    try {
      await resetAllWalletBalancesService();
      console.log('[CRON] Monthly wallet balances reset successfully!');
    } catch (error) {
      console.error('[CRON] Error during wallet reset:', error);
    }
  },
  null,  // onComplete callback (not used)
  false, // don't start automatically
  'Asia/Karachi'  // timezone
);

module.exports = walletBalanceJob;
