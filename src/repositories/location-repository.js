const CrudRepository = require('./crud-repository');
const { Location } = require('../models');
class LocationRepository extends CrudRepository {
    constructor() {
        super(Location);
    }
}

module.exports = LocationRepository;