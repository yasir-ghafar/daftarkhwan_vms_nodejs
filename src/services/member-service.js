const { StatusCodes } = require('http-status-codes');
const { MemberRepository } = require('../repositories');

const memberRepository = new MemberRepository();

async function createMember(data) {
    try {
        console.log(`reached in member service: ${data}`)
        const member = await memberRepository.create(data);
        return member;
    } catch(error) {
        console.log(`Error in controller: ${error}`)
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Cannot create a new Airplane object', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}

async function getAllMembers() {
    try {
        const members = await memberRepository.getAll();
        return members;
    } catch(error) {
        if (error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.array.forEach((err) => {
                explanation.push(err.message);
            });
            console.log(explanation);
            throw new AppError('Cannot create a new Airplane object', StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw error;
    }
}


module.exports = {
    createMember,
    getAllMembers
}