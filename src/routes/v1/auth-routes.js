const express = require('express');
const multer = require('multer');
const path = require('path');

const { AuthController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.post('/register',
    AuthMiddlewares.checkIfUserExists,
    AuthController.registerUser,);
    
router.post('/login', AuthController.loginUser);

router.get('/users/profile',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    AuthController.getUserProfile);

router.put('/users/edit/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin',),
    AuthController.editUser);


router.get('/users',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    AuthController.getUsers);

router.get('/users/company/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    AuthController.getUsersByCompany
)

module.exports = router;