const express = require('express');
const { AuthService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');
const { success, message } = require('../utils/common/error-response');

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


async function getUsers(req, res) {
    try {
        let users;
        console.log(req.role)
        if (req.role === 'admin') {
            users  = await AuthService.getAllUsers();
        } else if (req.role === 'member') {
            users = await AuthService.getUserProfile(req.userId);
        } else {
            return res.status(StatusCodes.FORBIDDEN)
                .json({
                    success: false,
                    message: 'Access denied: Invalid role'
                });
        }
        SuccessResponse.data = users;
        SuccessResponse.message = 'Users Fetched Successfully';
        return res
        .status(StatusCodes.OK)
        .json(SuccessResponse)
    } catch(error) {
            console.log(error);
            ErrorResponse.error = error;
            return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUsers
    
}