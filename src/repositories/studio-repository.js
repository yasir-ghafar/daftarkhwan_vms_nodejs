const CrudRepository = require('./crud-repository');
const { Studio } = require('../models');


class StudioRepository extends CrudRepository {
    constructor() {
        super(Studio);
    }
}

module.exports = StudioRepository