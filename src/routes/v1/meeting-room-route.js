const express = require('express');
const { MeetingRoomController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares')

const router = express.Router();


router.post('/',
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.createMeetingRoom);

router.get('/:id', MeetingRoomController.getRoomById);
router.get('/',
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    MeetingRoomController.getAllRooms);
router.delete('/delete',
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.deleteMeetingRoom);
router.put('/:id',
    AuthMiddlewares.authorizeRoles('admin'),
    MeetingRoomController.updateMeetingRoom);



router.get('/location/:id',
    AuthMiddlewares.authorizeRoles('admin', 'member'),
    MeetingRoomController.getRoomsByLocationId);
module.exports = router;
