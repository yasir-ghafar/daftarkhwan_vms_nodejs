const express = require('express');
const { AuthService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');

async function registerUser(req, res) {
    console.log('in Controller..')
    try {
        if (req.body) { 
            console.log(req.body);           
            const user = await AuthService.createUser(req.body);
            SuccessResponse.data = user;
            return res.json(SuccessResponse);
        }
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);    
    }
    return SuccessResponse;
}

async function loginUser(req, res) {
    try {
        if (req.body) {
            console.log(req.body);
            const {email, password} = req.body;
          
            const user = await AuthService.loginUser(email, password);
    
            SuccessResponse.data = user;
            SuccessResponse.message = 'User Logged In Successfully!'
            return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
        }
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);    
    }
    return SuccessResponse;
}


module.exports = {
    registerUser,
    loginUser
}