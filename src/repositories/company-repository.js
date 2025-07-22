const CrudRepository = require('./crud-repository');
const { Company } = require('../models');

class CompanyRepository extends CrudRepository{
    constructor() {
        super(Company);
    }
}


module.exports = CompanyRepository;