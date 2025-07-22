const { StatusCodes } = require('http-status-codes');
const { sequelize, Wallet } = require('../models');

const argon2 = require('argon2');
const jwt = require('jsonwebtoken')

const { AuthRepository } = require('../repositories');
const AppError = require('../utils/error/app-error');
const { ErrorResponse } = require('../utils/common');
const { ServerConfig } = require('../config');



const authRepository = new AuthRepository();

async function createUser(userData) {
    const transaction = await sequelize.transaction();
    try {

        const hashedPassword = await hashPassword(userData.password);


        const user = await authRepository.create({
            ...userData,
            password_hash: hashedPassword
        }, { transaction});

        // if user rols is a member, create a wallet

        if (user.role === 'member') {
            await Wallet.create({
                user_id: user.id,
                balance: 50.00
            }, { transaction });
        }

        await transaction.commit();

        const safeUser = { ...user.dataValues };
        delete safeUser.password_hash;

        return safeUser;

    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Cannot create a new User object', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function checkUserAlreadyExists(email) {
    console.log(`Checking Email: ${email}`)
    const user = await authRepository.getByEmail(email);
    if (user) 
        return true;
    else 
        return false;
}


async function loginUser(email, password) {
    try {
        const user = await authRepository.getByEmail(email);
        if (!user) {
            throw new AppError('User Not Found!', 404);
        }
        
        
        console.log(password);
        console.log(user.password_hash);
        const isMatch = await comparePassword(user.password_hash, password);
        
        if (!isMatch) {
            throw new AppError('Password is Incorrect', 400);
        }


        const token = issueToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        })
       
        console.log(token);

        const safeUser = { ...user.dataValues }
        delete safeUser.password_hash;

        return {...safeUser,
             authorization: token};
    } catch(error) {
        await transaction.rollback();
        if (error.name == 'SequelizeValidationError') {
            let explanation = error.errors.map(err => err.message);
            console.log(explanation);
            throw new AppError('Cannot create a new User object', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}


async function hashPassword(password) {
    return await  argon2.hash(password);
}

async function comparePassword(hashedPassword, password) {
    try{
        return await argon2.verify(hashedPassword, password);
    } catch(error) {
        console.log(`Error in comparing password: ${error}`)
    }
}


function issueToken(payload) {
  return jwt.sign(payload, ServerConfig.JWT_SECRET, { expiresIn: '1h' });
}

async function verifyToken(token) {
  return await jwt.verify(token, ServerConfig.JWT_SECRET);
}

module.exports = {
    createUser,
    loginUser,
    checkUserAlreadyExists,
    verifyToken
    
}