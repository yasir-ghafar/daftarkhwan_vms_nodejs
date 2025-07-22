const CrudRepository = require('./crud-repository');
const { User } = require('../models');

class AuthRepository extends CrudRepository {
    constructor() {
        super(User);
    }
}

module.exports = AuthRepository;