const { StatusCodes } = require("http-status-codes");
const { sequelize, Wallet, Company, Location, User } = require("../models");
const { Op } = require("sequelize");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const { AuthRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");
const { ServerConfig } = require("../config");

const authRepository = new AuthRepository();

/// create User
async function createUser(userData) {
  console.log(">>> Hitting /Create User in Service");
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
    await transaction.rollback();
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log("Explanation::", explanation);
      throw new AppError(
        "Cannot create a new User object",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
  }
}

/// Optimized Edit User
async function editUser(userId, updateData) {
  console.log("🟢 [editUser] Starting Edit User process...");

  const id = Number(userId);
  console.log("🟣 [editUser] Parsed userId:", id);

  if (isNaN(id)) {
    console.error("❌ [editUser] Invalid user ID:", userId);
    throw new AppError("Invalid user ID", StatusCodes.BAD_REQUEST);
  }

  const user = await authRepository.get(id);
  if (!user) {
    console.error("❌ [editUser] User not found with id:", id);
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  console.log("🟢 [editUser] Current user data:", JSON.stringify(user.dataValues, null, 2));

  // 🧹 Clean up undefined / null values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === null) {
      delete updateData[key];
    }
  });
  console.log("🧩 [editUser] Cleaned updateData:", JSON.stringify(updateData, null, 2));

  // 🧾 Validate empty strings for required fields
  const requiredFields = ["name", "email", "phoneNumber"];
  for (const field of requiredFields) {
    if (
      updateData[field] !== undefined &&
      typeof updateData[field] === "string" &&
      !updateData[field].trim()
    ) {
      console.warn(`⚠️ [editUser] Field '${field}' is empty`);
      throw new AppError(`${field} cannot be empty`, StatusCodes.BAD_REQUEST);
    }
  }

  // 🧩 Detect only changed fields
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (user[key] !== value) {
      fieldsToUpdate[key] = value;
    }
  }

  console.log("🧠 [editUser] Fields to update:", JSON.stringify(fieldsToUpdate, null, 2));

  // ⏩ Skip if nothing changed
  if (Object.keys(fieldsToUpdate).length === 0) {
    console.log("⚙️ [editUser] No changes detected — skipping update.");
    const safeUser = { ...user.dataValues };
    delete safeUser.password_hash;
    return safeUser;
  }

  // 🔎 Duplicate check (only if phone/email changed)
  const duplicateCheck = {};

  if (
    fieldsToUpdate.phoneNumber &&
    fieldsToUpdate.phoneNumber !== user.phoneNumber
  ) {
    duplicateCheck.phoneNumber = fieldsToUpdate.phoneNumber;
  }

  if (fieldsToUpdate.email && fieldsToUpdate.email !== user.email) {
    duplicateCheck.email = fieldsToUpdate.email;
  }

  console.log("🟡 [editUser] Duplicate check payload:", JSON.stringify(duplicateCheck, null, 2));

  if (Object.keys(duplicateCheck).length > 0) {
    // Sequelize expects OR conditions as an array
    const orConditions = Object.entries(duplicateCheck).map(([key, value]) => ({ [key]: value }));

    console.log("🔍 [editUser] Performing duplicate check with conditions:", JSON.stringify(orConditions, null, 2));

    const existingUser = await User.findOne({
      where: {
        [Op.or]: orConditions,
      },
    });

    console.log("🔎 [editUser] Duplicate check result:", existingUser ? existingUser.dataValues : "No user found");

    if (existingUser && Number(existingUser.id) !== Number(id)) {
      console.error("❌ [editUser] Duplicate conflict detected:", {
        currentId: id,
        existingUserId: existingUser.id,
        duplicateCheck,
      });

      const conflictField =
        existingUser.phoneNumber === fieldsToUpdate.phoneNumber
          ? "Phone number"
          : "Email";
      throw new AppError(`${conflictField} already in use`, StatusCodes.CONFLICT);
    }
  }

  // 🔐 Handle password hashing
  if (fieldsToUpdate.password) {
    console.log("🔐 [editUser] Hashing password...");
    fieldsToUpdate.password_hash = await hashPassword(fieldsToUpdate.password);
    delete fieldsToUpdate.password;
  }

  console.log("💾 [editUser] Final update payload:", JSON.stringify(fieldsToUpdate, null, 2));

  try {
    await authRepository.update(id, fieldsToUpdate);
    console.log("✅ [editUser] User update successful for ID:", id);
  } catch (err) {
    console.error("💥 [editUser] Error while updating user:", err);
    throw err; // rethrow to capture Sequelize validation/unique constraint errors
  }

  // 🔁 Fetch updated user
  const updatedUser = await authRepository.get(id);
  const safeUser = { ...updatedUser.dataValues };
  delete safeUser.password_hash;

  console.log("🟢 [editUser] Final updated user:", JSON.stringify(safeUser, null, 2));
  return safeUser;
}

/// method to check if the user is already exists
async function checkUserAlreadyExists(email) {
  console.log(`Checking Email: ${email}`);
  const user = await authRepository.getByEmail(email);
  if (user) return true;
  else return false;
}

async function loginUser(email, password) {
  console.log(">>> Hitting /Login User in Service");
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
    const user = await authRepository.getWithOptions(userId, {
      include: [
                    {
                        model: Company,
                        attributes: ['id', 'name', 'LocationId', 'locationName'],
                    },
                    {
                        model: Wallet,
                        attributes: ['id', 'meeting_room_credits', 'printing_credits'],
                    },
                  
                ]
    });


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
