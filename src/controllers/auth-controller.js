const express = require('express');
const { AuthService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');
const { success, message } = require('../utils/common/error-response');
const { getAllUsersByCompanyId } = require('../services/auth-service');

async function registerUser(req, res) {
    console.log('in Controller..')
    try {
        if (req.body) { 
            console.log(req.body);           
            const user = await AuthService.createUser(req.body);
            SuccessResponse.data = user;
            SuccessResponse.message = "User Registered Successfully!"
            return res.status(StatusCodes.CREATED)
                        .json(SuccessResponse);
        }
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);    
    }
}

async function editUser(req, res) {
    const { id } = req.params;
    try {
        if (req.body) { 
            console.log(req.body);           
            const user = await AuthService.editUser(id, req.body);
            SuccessResponse.data = user;
            SuccessResponse.message = "User Updated successfully!"
            return res.json(SuccessResponse);
        }
    } catch(error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);    
    }
}

async function loginUser(req, res) {

    console.log(">>> Hitting /login route", req.body);
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
        console.log("Error in controller: ", error);
        ErrorResponse.message = error.explanation;
        ErrorResponse.error = error.explanation;
        return res
            .status(error.statusCode)
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


async function getUserProfile(req, res) {

    try {
        console.log(req.role);
        console.log("User Id",req.userId);
        const user = await AuthService.getUserProfile(req.userId);
        SuccessResponse.data = user;
        SuccessResponse.message = 'User Fetched Successfully';
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

async function getUsersByCompany(req, res) {
    try {
        const { id } = req.params;
    if (!id) {
        ErrorResponse.message = 'Company Id is Required!';
        return res.status(StatusCodes.BAD_REQUEST)
        .json({ErrorResponse});
    }
    
    const users = await getAllUsersByCompanyId(id);
    SuccessResponse.data = users;
    SuccessResponse.message = 'Users Fetched Successfully!'

    return res.status(StatusCodes.OK)
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
    getUsers,
    getUsersByCompany,
    editUser,
    getUserProfile
}