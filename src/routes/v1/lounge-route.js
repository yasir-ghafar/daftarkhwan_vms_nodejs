const express = require('express');
const { uploadMiddleWares, AuthMiddlewares } = require('../../middlewares');
const { LoungeController } = require('../../controllers');
const { uploadMiddlewares } = require('../../middlewares/upload-middlewares');

const router = express.Router();

router.post('/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    uploadMiddlewares.loungeImage,
    LoungeController.createLounge);

router.get('/',
    LoungeController.getAllLounges);

module.exports = router