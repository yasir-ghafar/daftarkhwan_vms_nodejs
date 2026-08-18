const CrudRepository = require('./crud-repository');
const { Lounge } = require('../models');

class LoungeRepository extends CrudRepository {
    constructor() {
        super(Lounge);
    }
}

module.exports = LoungeRepository