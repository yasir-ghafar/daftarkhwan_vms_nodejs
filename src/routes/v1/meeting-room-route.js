const express = require('express');
const { MeetingRoomController } = require('../../controllers');

const router = express.Router();

router.get('/amenities', MeetingRoomController.getAllAmenities);

router.post('/', MeetingRoomController.createMeetingRoom);

router.get('/:id', MeetingRoomController.getRoomById);
router.get('/', MeetingRoomController.getAllRooms);
router.delete('/delete', MeetingRoomController.deleteMeetingRoom);
router.put('/:id', MeetingRoomController.addCredits);

router.post('/amenities', MeetingRoomController.createAmenity);

router.delete('/amenities/delete', MeetingRoomController.deleteAmenity);
router.get('/location/:id', MeetingRoomController.getRoomsByLocationId);
module.exports = router;
