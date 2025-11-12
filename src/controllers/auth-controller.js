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
        }
        else if (req.role === 'manager') {
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


async function fogotPassword(req, res) {
    console.log(">>> Hitting /login route", req.body);
    try {
        if (req.body) {

            const {email} = req.body;
            const otpResponse = await AuthService.generateOtp(email);
            SuccessResponse.data = otpResponse;
            SuccessResponse.message = "OTP sent successfully to your email."
            console.log(req.body);
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

async function verifyUserOtp(req, res) {
    console.log(">>> Hitting /login route", req.body);
    try {
        if (req.body) {
            const {email, otp} = req.body;
            const otpResponse = await AuthService.verifyOtp(email, otp);
            SuccessResponse.data = otpResponse;
            console.log(req.body);
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

async function resetPassword(req, res) {
  console.log(">>> Hitting /reset-password", req.body);

  try {
    const { password, confirm_password } = req.body;
    const { userId, email } = req; // ✅ extracted by verifyResetToken middleware

    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized: Missing or invalid token" });
    }

    if (!password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "New password is required" });
    }

    // ✅ Call service method with userId and new password
    const response = await AuthService.resetPassword(userId, password, confirm_password);

    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);

  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    ErrorResponse.message = error.message || "Something went wrong";
    ErrorResponse.error = error.explanation || error.message;

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}


async function resendOtp(req, res) {
  console.log(">>> Hitting /resend-otp", req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email is required to resend OTP" });
    }

    const result = await AuthService.resendOtp(email);

    SuccessResponse.data = result;
    SuccessResponse.message = "OTP resent successfully!";
    return res.status(StatusCodes.OK).json(SuccessResponse);

  } catch (error) {
    console.error("Error in resendOtp controller:", error);
    ErrorResponse.message = error.message || "Something went wrong";
    ErrorResponse.error = error.explanation || error.message;

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUsersByCompany,
    editUser,
    getUserProfile,
    fogotPassword,
    verifyUserOtp,
    resetPassword,
    resendOtp
}