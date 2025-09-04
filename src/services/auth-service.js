const { StatusCodes } = require("http-status-codes");
const { sequelize, Wallet, Company, Location } = require("../models");

const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const { AuthRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");
const { ServerConfig } = require("../config");

const authRepository = new AuthRepository();

/// create User
async function createUser(userData) {
  const transaction = await sequelize.transaction();
  try {
    const hashedPassword = await hashPassword(userData.password);

    const user = await authRepository.create(
      {
        ...userData,
        password_hash: hashedPassword,
      },
      { transaction }
    );

    // if user rols is a member, create a wallet

    if (user.role === "member") {
      await Wallet.create(
        {
          user_id: user.id,
          balance: 50.0,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const safeUser = { ...user.dataValues };
    delete safeUser.password_hash;

    return safeUser;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new User object",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

/// Edit User
async function editUser(userId, updateData) {
  const transaction = await sequelize.transaction();
try {
  const user = await authRepository.get(userId);

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  //validations checks 

  if (
      updateData.name !== undefined &&
      (!updateData.name || updateData.name.trim() === "")
    ) {
      throw new AppError("Name cannot be empty", StatusCodes.BAD_REQUEST);
    }

    if (
      updateData.email !== undefined &&
      (!updateData.email || updateData.email.trim() === "")
    ) {
      throw new AppError("Email cannot be empty", StatusCodes.BAD_REQUEST);
    }

    if (
      updateData.number !== undefined &&
      (!updateData.number || updateData.number.trim() === "")
    ) {
      throw new AppError("Number cannot be empty", StatusCodes.BAD_REQUEST);
    }

    // Handle password update
    if (updateData.password) {
      updateData.password_hash = await hashPassword(updateData.password);
      delete updateData.password; // prevent saving raw password
    }

    const updatedUser = await authRepository.update(userId, updateData, {
      transaction,
    });

    await transaction.commit();

    const safeUser = { ...updatedUser.dataValues };
    delete safeUser.password_hash;

    return safeUser;


  } catch (error) {
    await transaction.rollback();
    if (error.name == "SequelizeValidationError") {
      let explanation = error.errors.map((err) => err.message);
      console.log(explanation);
      throw new AppError(
        "Unable to update user",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}
/// method to check if the user is already exists
async function checkUserAlreadyExists(email) {
  console.log(`Checking Email: ${email}`);
  const user = await authRepository.getByEmail(email);
  if (user) return true;
  else return false;
}

// async function loginUser(email, password) {
//     try {
//         const user = await authRepository.getByEmail({
//                 where: {
//                     email: email
//                 },
//                 include: [
//                 {
//                     model: Company,
//                     as: 'company',
//                     attributes: ['id', 'name', 'LocationId', 'locationName'],
//                 }
//             ]
//             });

//         if (!user) {
//             throw new AppError('User Not Found!', 404);
//         }
//         console.log(user);
//         console.log(password);
//         console.log(user.password_hash);
//         const isMatch = await comparePassword(user.password_hash, password);

//         if (!isMatch) {
//             throw new AppError('Password is Incorrect', 400);
//         }
//         const token = issueToken({
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role
//         })

//         console.log(token);

//         const safeUser = { ...user.dataValues }
//         delete safeUser.password_hash;

//         return {...safeUser,
//              authorization: token};
//     } catch(error) {
//       console.log(error);
//         await transaction.rollback();
//         if (error.name == 'SequelizeValidationError') {
//             let explanation = error.errors.map(err => err.message);
//             console.log(explanation);
//             throw new AppError('Cannot create a new User object', StatusCodes.INTERNAL_SERVER_ERROR);
//         }
//         throw error;
//     }
// }

async function loginUser(email, password) {
  try {
    const user = await authRepository.getByEmail(email);

    if (!user) {
      throw new AppError("User Not Found!",
         StatusCodes.NOT_FOUND);
    }

    console.log(password);
    console.log(user.password_hash);
    const isMatch = await comparePassword(user.password_hash, password);

    if (!isMatch) {
      throw new AppError("Incorrect Password!",
         StatusCodes.BAD_REQUEST);
    }
    const token = issueToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    console.log(token);

    const safeUser = { ...user.dataValues };
    delete safeUser.password_hash;

    return { ...safeUser, authorization: token };
  } catch (error) {
    console.log(error);
    //await transaction.rollback();
    if (error.name == "SequelizeValidationError") {
      let explanation = error.errors.map((err) => err.message);
      console.log(explanation);
      throw new AppError(
        "Unable to Login, Something went wrong.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function hashPassword(password) {
  return await argon2.hash(password);
}

async function comparePassword(hashedPassword, password) {
  console.log("Passowrd Hashed", hashedPassword);
  console.log("Passowrd", password);
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    console.log(`Error in comparing password: ${error}`);
  }
}

async function getUserProfile(userId) {
  try {
    const user = await authRepository.get(userId);


    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // normalize to plain object
    const safeUser = user.get ? user.get({ plain: true }) : { ...user };
    delete safeUser.password_hash;

    return safeUser;

  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map((err) => err.message);
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch User",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getAllUsers() {
  try {
    const users = await authRepository.getAll({
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Company,
          attributes: ["id", "name", "LocationId", "locationName"],
        },
        {
          model: Wallet,
          attributes: ["id", "meeting_room_credits", "printing_credits"],
        },
      ],
    });
    return users;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Location",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

async function getAllUsersByCompanyId(company_id) {
  try {
    const users = await authRepository.getAll({
      where: { company_id },
    });
    return users;
  } catch (error) {
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Unable to Fetch Location",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

function issueToken(payload) {
  return jwt.sign(payload, ServerConfig.JWT_SECRET, { expiresIn: "12h" });
}

async function verifyToken(token) {
  return await jwt.verify(token, ServerConfig.JWT_SECRET);
}

module.exports = {
  createUser,
  editUser,
  loginUser,
  checkUserAlreadyExists,
  verifyToken,
  getUserProfile,
  getAllUsers,
  getAllUsersByCompanyId,
};
