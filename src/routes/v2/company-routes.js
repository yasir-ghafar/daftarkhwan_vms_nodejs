const express = require('express');

const { CompanyController } = require('../../controllers');

const router = express.Router();

router.post('/', CompanyController.createCompanyWithWallet);

module.exports = router;

