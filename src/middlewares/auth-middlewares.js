const { StatusCodes } = require('http-status-codes');
const { AuthService } = require('../services');
const { ErrorResponse } = require('../utils/common');
const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../config');
const { message } = require('../utils/common/error-response');

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

async function getUserAndGetUserId(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, ServerConfig.JWT_SECRET);
    // Attach user ID to the request
    req.userId = decoded.id;
    req.role = decoded.role;
    // Optionally, you can attach full user data here if token includes it
    // req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

}

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req.role);
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};

module.exports = {
    checkIfUserExists,
    authenticateToken,
    getUserAndGetUserId,
    authorizeRoles
}