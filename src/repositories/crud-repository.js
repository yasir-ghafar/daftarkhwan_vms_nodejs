const { where } = require('sequelize');
const { Logger } = require('../config');

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const response = await this.model.create(data);
            return response;
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: create');
            throw error;
        }
    }

    async destroy(data) {
        try {
            const response = await this.model.destroy({
                where: {
                    id: data
                }
            });
            console.log(`In Repository: ${response}`);
            return response;
            
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: destroy');
            throw error;
        }
    }

    async get(data) {
        try {
            const response = await this.model.findByPk(data, { raw: true });
            return response;
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: get');
            throw error;
        }
    }

    async getAll() {
        try {
            const response = await this.model.findAll();
            return response;
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: getAll');
            throw error;
        }
    }

    async getAll(options = {}) {
        try {
            const response = await this.model.findAll(options);
            return response;
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: getAll');
            throw error;
        }
    }

    async update(id, data) { // data -> {col: value,.....}
        try {
            const response = await this.model.update(data, {
                where: {
                    id: id
                }
            })
            return response;
        } catch(error) {
            Logger.error('Something went wrong in the Crud Repo: update');
            throw error;
        }
    }

    

    async getByEmail(data) {
        try {
            const response = await this.model.findOne({
                where: {
                    email: data
                }
            });
            return response;
        } catch(error) {
            Logger.error('Somthing went wrong in Crud Repo: findOne');
            throw error;
        }
    }


}


module.exports = CrudRepository;