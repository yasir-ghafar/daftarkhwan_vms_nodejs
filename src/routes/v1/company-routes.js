const express = require('express');

const { CompanyController } = require('../../controllers');

const router = express.Router();

router.post('/', CompanyController.createCompany);

router.get('/:id', CompanyController.getCompanyById);
router.get('/', CompanyController.getCompanies);

router.delete('/delete', CompanyController.deletCompany);

router.put('/update-status', CompanyController.updateCompanyStatus);

module.exports = router;