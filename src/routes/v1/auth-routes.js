const express = require('express');
const multer = require('multer');
const path = require('path');

const { AuthController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();
    
router.post('/login', AuthController.loginUser);

router.post('/register',
    AuthMiddlewares.checkIfUserExists,
    AuthController.registerUser,);


router.get('/users/profile',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    AuthController.getUserProfile);

router.put('/users/edit/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin',),
    AuthController.editUser);

router.get('/users',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager', 'member'),
    AuthController.getUsers);

router.get('/users/company/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'manager',),
    AuthController.getUsersByCompany
)


router.post('/forgot-password',
    AuthController.fogotPassword
)


router.post('/verify-otp',
    AuthController.verifyUserOtp
)

router.post('/reset-password',
    AuthMiddlewares.verifyResetToken,
    AuthController.resetPassword
)


///reset-password

module.exports = router;