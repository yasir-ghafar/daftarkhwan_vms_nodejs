const { StatusCodes } = require('http-status-codes');
const { AuthService } = require('../services');
const { ErrorResponse } = require('../utils/common');
const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../config');

async function checkIfUserExists(req, res, next) {
    try {
        const email = req.body.email;
        console.log(email);
        const userExists = await AuthService.checkUserAlreadyExists(email);
        if (userExists) {
            console.log('User Exists');
            ErrorResponse.message = 'User already exists with this email'
            return  res
                    .status(StatusCodes.CONFLICT)
                    .json(ErrorResponse)
        } else {
            console.log('User do not Exists');
        }
        next();
    } catch(error) {
        console.log(error);
        ErrorResponse.message = error
            return  res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json()
    }
}


async function authenticateToken(req, res, next) {
    console.log('Authenticating..')
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, ServerConfig.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({message: 'Invalid or expired token'});
        }

        console.log(user);
        next();
    });
}


module.exports = {
    checkIfUserExists,
    authenticateToken
}