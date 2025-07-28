const { StatusCodes } = require("http-status-codes");
const { CompanyRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");




const companyRepository = new CompanyRepository();

async function createCompany(data) {
  try {
    console.log(`reached in company service: ${data}`);
    const company = await companyRepository.create(data);
    return company;
  } catch (error) {
    console.log(`Error in controller: ${error}`);
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

async function deleteCompany(id) {
  try {
    const company = await companyRepository.get(id);

    if (!company) {
      throw new AppError("Company not found.", StatusCodes.NOT_FOUND);
    }


    const isDeleted = await companyRepository.destroy(id);

    if (!isDeleted) {
      throw new AppError(
        "Failed to delete company",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      message: "Company deleted Successfully",
      data: null,
    };
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map((err) => err.message);
      throw new AppError(explanation.join(", "), StatusCodes.BAD_REQUEST);
    }

    throw error;
  }
}

async function getCompanyById(id) {
  try {
    const company = await companyRepository.get(id);

    if (!company) {
      throw new AppError("Company not found.", StatusCodes.NOT_FOUND);
    }

    return company;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Locations",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function updateCompanyStatus(id, status) {
  try {
    const company = await companyRepository.get(id);

    if (!company) {
      throw new AppError("Company not found.", StatusCodes.NOT_FOUND);
    }

    const updatedCompany = await companyRepository.update(id, { status });

  

    return updatedCompany;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Update Company",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

module.exports = {
  createCompany,
  getAllCompanies,
  deleteCompany,
  getCompanyById,
  updateCompanyStatus
};
