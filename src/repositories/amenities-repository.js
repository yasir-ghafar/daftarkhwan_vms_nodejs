const CrudRepository = require('./crud-repository');
const { Amenity } = require('../models');

class AmenityRepository extends CrudRepository{
    constructor() {
        super(Amenity);
    }
}


module.exports = AmenityRepository;