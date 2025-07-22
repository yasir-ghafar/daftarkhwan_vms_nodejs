const CrudRepository = require('./crud-repository');
const { Member } = require('../models');

class MemberRepository extends CrudRepository {
        constructor() {
            super(Member);
        }
}

module.exports = MemberRepository;