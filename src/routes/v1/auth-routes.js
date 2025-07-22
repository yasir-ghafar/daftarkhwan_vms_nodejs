const express = require('express');

const { AuthController } = require('../../controllers')
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router()

router.post('/register',
    AuthMiddlewares.checkIfUserExists,
    AuthController.registerUser);
    
router.post('/login', AuthController.loginUser)

module.exports = router;