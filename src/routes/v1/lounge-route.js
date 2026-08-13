const express = require('express');
const { uploadMiddleWares, AuthMiddlewares } = require('../../middlewares');
const { LoungeController } = require('../../controllers');

const router = express.Router();

router.post('/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    LoungeController.createLounge);

router.get('/',
    LoungeController.getAllLounges);


module.exports = router