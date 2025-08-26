const { StatusCodes } = require("http-status-codes");
const { sequelize } = require('../models');
const { CompanyRepository } = require("../repositories");
const walletRepository = require("../repositories/wallet-repository");
const AppError = require("../utils/error/app-error");
const { User, Wallet, Location } = require('../models');
const { where } = require("sequelize");

const companyRepository = new CompanyRepository();

async function createCompany(data) {
  console.log(`reached in company service: ${data}`);
  try {
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
    const companies = await companyRepository.getAll({
      include: [
            {
                model: User,
                include: [
                    {
                        model: Wallet
                    }
                ]
            },
            {
                model: Location,
                as: 'location'
            }
        ]
    });
    return companies;
  } catch (error) {
    console.log("Error in Company Service:", error);
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to fetch companies",
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
    const company = await companyRepository.getWithOptions(id, {
      include: [
        {
          model: User,
          include: [Wallet]
        },
        {
          model: Location,
          as: 'location'
        }
      ]
    });

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
        "Unable to Fetch Companies",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}


async function getCompaniesByLocationId(id) {
  try {
    console.log("Location Id: ", id)
    const companies = await companyRepository.getAll({
      where: {
        LocationId : id
      },
      include: [
        {
          model: User,
          include: [Wallet]
        },
        {
          model: Location,
          as: 'location'
        }
      ]
    });
 
    console.log("Companies Fetched:",companies);
    return companies;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Companies",
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



async function updateWalletCreditsService(walletId, updates) {

    console.log("getting here in service")
    return await sequelize.transaction(async (transaction) => {
        // Update wallet credits
        const updatedWallet = await walletRepository.updatewalletCredits(walletId, updates, transaction);

        // Optionally log transactions
        if (updates.meeting_room_credits) {
            await walletRepository.logWalletTransaction(
                walletId,
                updates.meeting_room_credits > 0 ? 'credit' : 'debit',
                Math.abs(updates.meeting_room_credits),
                'Meeting room credit update',
                transaction
            );
        }

        if (updates.printing_credits) {
            await walletRepository.logWalletTransaction(
                walletId,
                updates.printing_credits > 0 ? 'credit' : 'debit',
                Math.abs(updates.printing_credits),
                'Printing credit update',
                transaction
            );
        }

        return updatedWallet;
    });
}


async function getWalletTransactionsById(walletId) {

  try {
      return await sequelize.transaction(async (transaction) => {
        // Update wallet credits
        const transactions = await walletRepository.getWalletTransactions(walletId, transaction);

        return transactions;
    });
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Companies",
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
  updateCompanyStatus,
  updateWalletCreditsService,
  getCompaniesByLocationId,
  getWalletTransactionsById
};
