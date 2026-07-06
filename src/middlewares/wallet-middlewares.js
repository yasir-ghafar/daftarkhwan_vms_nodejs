const { StatusCodes } = require('http-status-codes');
const { WalletService } = require('../services');
const { ErrorResponse } = require('../utils/common');



async function checkWalletMonthlyBalance(req, res, next) {
    try {
        const id = req.params.id;
        const credits = req.body.meeting_room_credits;
        console.log(`reached in Middleware with wallet id: ${id} and new Meeting Room Credits: ${credits}`);

        const wallet = await WalletService.checkAndUpdateMonthlyBalance(id, credits);

        console.log(`Wallet with the Monthly Credits: ${wallet.monthly_credits}`);
        //req.wallet = wallet;
        next();
    } catch (error) {
        console.log(error);
        ErrorResponse.message = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

module.exports = {
    checkWalletMonthlyBalance
}