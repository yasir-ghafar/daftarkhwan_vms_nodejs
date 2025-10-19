const express = require('express');
const { MeetingRoomController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares')

const router = express.Router();



router.post('/',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.createMeetingRoom);

router.get('/status/:id', MeetingRoomController.getMeetingRoomStatus);

router.get("/:id/availability", MeetingRoomController.getRoomAvailabilityByDate);

router.get('/:id', MeetingRoomController.getRoomById);
router.get('/', MeetingRoomController.getAllRooms);

router.delete('/delete',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.deleteMeetingRoom);

router.put('/:id',
    AuthMiddlewares.getUserAndGetUserId,
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.updateMeetingRoom);



router.get('/location/:id',
    MeetingRoomController.getRoomsByLocationId);
module.exports = router;
