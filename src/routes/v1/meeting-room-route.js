const express = require('express');
const { MeetingRoomController } = require('../../controllers');

const router = express.Router();


router.post('/', MeetingRoomController.createMeetingRoom);

router.get('/:id', MeetingRoomController.getRoomById);
router.get('/', MeetingRoomController.getAllRooms);
router.delete('/delete', MeetingRoomController.deleteMeetingRoom);
router.put('/:id', MeetingRoomController.addCredits);
router.put('/:id', MeetingRoomController.upda)

router.get('/location/:id', MeetingRoomController.getRoomsByLocationId);
module.exports = router;
