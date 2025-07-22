const { StatusCodes } = require('http-status-codes');
const { CompanyRepository } = require("../repositories");

const companyRepository = new CompanyRepository();

async function createCompany(data) {
  try {
    console.log(`reached in company service: ${data}`)
    const company = await companyRepository.create(data);
    return company;
  } catch (error) {
    console.log(`Error in controller: ${error}`)
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create Company",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getAllCompanies() {
  try {
    const companies = await companyRepository.getAll();
    return companies;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Airplane object",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

module.exports = {
  createCompany,
  getAllCompanies
};
