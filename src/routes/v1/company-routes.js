const express = require('express');

const { CompanyController } = require('../../controllers');

const router = express.Router();

router.post('/', CompanyController.createCompany);

router.get('/', CompanyController.getCompanies);

module.exports = router;