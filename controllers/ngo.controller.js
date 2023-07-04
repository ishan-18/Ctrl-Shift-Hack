const NGO = require('../models/Ngos')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const fs = require('fs')
const path = require('path')

// @desc    GET ALL NGOs
// @route   GET /api/v1/ngo
// @access  Private
exports.getNGOs = asyncHandler(async (req,res,next) => {
        
    let query;

    console.log(req.params)

    const reqQuery = {...req.query} 

    const removeFields = ['select','sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);


    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    query = NGO.find(JSON.parse(queryStr))

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else{
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit
    const total = await NGO.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const pagination = {};
    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    const ngo = await query;

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    if(ngo){
        res.status(200).json({
            status: true,
            count: ngo.length,
            pagination,
            data: ngo
        })
    }else{
        return next(new ErrorResponse('Something went wrong', 500))
    }
});

// @desc    GET single NGO
// @route   GET /api/v1/ngo/:id
// @access  Private
exports.getNGO = asyncHandler(async (req,res,next) => {
    const ngo = await NGO.findById(req.params.id);
    
    if(!ngo){
        return next(new ErrorResponse(`NGO not found with id of ${req.params.id}`, 404));
    }

    res.setHeader('Allow', 'GET');
    res.status(200).json({
        success: true,
        data: ngo
    })
});

// @desc    Create new NGOs
// @route   POST /api/v1/ngo/
// @access  Private
exports.createNGO = asyncHandler(async (req,res,next) => {
    //Add user to req.body
    req.body.user = req.user.id    

    //Check for ngouser
    const publishedNgo = await NGO.findOne({ user: req.user.id })

    if(publishedNgo && req.user.role !== 'admin' ){
        return next(new ErrorResponse(`The user with this ID ${req.user.id} has already published a NGO`, 400));
    }

    const ngo = await NGO.create(req.body);

    res.setHeader('Allow', 'POST');
    res.status(201).json({
        status: true,
        data: ngo
    })
});

// @desc    PUT single NGO
// @route   PUT /api/v1/ngo/
// @access  Private
exports.updateNGO = asyncHandler(async (req,res,next) => {
    let ngo = await NGO.findById(req.params.id)

    if(!ngo){
        return next(new ErrorResponse(`NGO not found with id of ${req.params.id}`, 401));
    }

    if(ngo.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this ngo`, 401))
    }

    ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.setHeader('Allow', 'PUT');
    res.status(200).json({
        status: true,
        data: ngo
    })
})

// @desc    DELETE single NGO
// @route   DELETE /api/v1/ngo/
// @access  Private
exports.deleteNGO = asyncHandler(async (req,res,next) => {
    const ngo = await NGO.findById(req.params.id)

    if(!ngo){
        return next(new ErrorResponse(`NGO not found with id of ${req.params.id}`, 401));
    }

    if(ngo.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delet this ngo`, 401))
    }

    await NGO.findByIdAndDelete(req.params.id);

    res.setHeader('Allow', 'DELETE');
    res.status(200).json({
        status: true,
        msg: "Deleted Successfully"
    })
});



