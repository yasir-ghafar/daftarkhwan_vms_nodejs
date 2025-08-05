const express = require('express');
const { MeetingRoomController } = require('../../controllers');

const router = express.Router();

router.get('/', MeetingRoomController.getAllAmenities);
router.post('/', MeetingRoomController.createAmenity);
router.delete('/delete', MeetingRoomController.deleteAmenity);


module.exports = router;