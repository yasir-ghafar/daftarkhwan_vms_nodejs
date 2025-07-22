const CrudRepository = require('./crud-repository');
const { MeetingRoom } = require('../models');

class MeetingRoomRepository extends CrudRepository {
    constructor() {
        super(MeetingRoom);
    }
}


module.exports = MeetingRoomRepository