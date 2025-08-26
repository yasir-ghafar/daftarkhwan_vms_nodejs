const express = require('express');

const { CompanyController } = require('../../controllers');

const router = express.Router();

router.get('/wallet/transactions/:id', CompanyController.getWalletTransactions);

router.put('/wallets/:id', CompanyController.updateWalletCredits);

// router.post('/', CompanyController.createCompany);

// router.get('/location-id/:id', CompanyController.getCompaniesByLocationId);

// // keep generic routes at the end
// router.get('/:id', CompanyController.getCompanyById);

// router.delete('/delete', CompanyController.deletCompany);

// router.put('/update-status', CompanyController.updateCompanyStatus);



module.exports = router;