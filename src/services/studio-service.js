const { StatusCodes } = require('http-status-codes');
const { StudioRepository } = require('../repositories');



const studioRepository = new StudioRepository();


async function createStudio(data) {
    
}

async function getStudioById(id) {
    
}

async function getStudios() {
    
}


async function updateStudio(id, data) {
    
}

async function deleteStudio(id) {
    
}


module.exports = {
    createStudio,
    updateStudio,
    deleteStudio,
    getStudioById,
    getStudios
}