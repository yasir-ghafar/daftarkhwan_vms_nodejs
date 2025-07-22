const express = require('express');
const { MeetingRoomController } = require('../../controllers');

const router = express.Router();

router.post('/', MeetingRoomController.createMeetingRoom);

router.get('/', MeetingRoomController.getAllRooms);
router.put('/:id', MeetingRoomController.addCredits);

router.post('/amenities', MeetingRoomController.createAmenity);
router.get('/amenities', MeetingRoomController.getAllAmenities);
router.delete('/amenities/delete', MeetingRoomController.deleteAmenity);
module.exports = router;
