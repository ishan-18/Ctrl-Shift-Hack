const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req,res,next) => {
    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    res.setHeader('Allow', 'POST');

    sendTokenResponse(user, 200, res)

})

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password) {
        return next(new ErrorResponse('Please Enter an email and password', 400))
    }

    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorResponse('Invalid Credentials', 401))
    }

    const checkPassword = await user.matchPassword(password)
    if(!checkPassword){
        return next(new ErrorResponse('Invalid Credentials', 401))
    }

    res.setHeader('Allow', 'POST');

    sendTokenResponse(user, 200, res)

})

// @desc    Logout User / Clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req,res,next)=>{
    
    res.cookie('token', 'none', { 
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.setHeader('Allow', 'GET');
    
    res.status(200).json({
        status: true,
        data: {}
    })
})

// @desc    GET Current Login User
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id).lean()
    if(!user){
        return next(new ErrorResponse('User Not Found', 404))
    }

    const allowedTypes = ['application/json'];

    if (!req.headers.accept || !allowedTypes.some(type => req.accepts(type))) {
        return next(new ErrorResponse('Method Not Allowed', 406))
    }

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        status: true,
        data: user
    })
})

//Get token from model, create cookie and send res
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token
    })
}
