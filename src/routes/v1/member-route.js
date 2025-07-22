const express = require('express');

const { MemberController } = require('../../controllers');

const router = express.Router();


router.post('/', MemberController.createMember);

router.get('/', MemberController.getAllMembers);


module.exports = router;