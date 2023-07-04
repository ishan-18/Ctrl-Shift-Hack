const NGO = require('../models/Ngos')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const {client} = require('../server')
const geocoder = require('../utils/geocoder')

const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);
const delAsync = promisify(client.del).bind(client);

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

    const ngoData = await client.getAsync('ngos');
    
    if (ngoData) {
        res.status(200).json(JSON.parse(ngoData));
    }else{
        const ngo = await query;

        client.setexAsync('ngos', 3600, JSON.stringify(ngo));

        res.setHeader('Allow', 'GET');
        res.setHeader('Content-Type', 'application/json');
        if(ngo){
            res.status(200).json({
                code: 200,
                status: true,
                message: "Showing the List of NGOs",
                count: ngo.length,
                pagination,
                Ngos: ngo
            })
        }else{
            return next(new ErrorResponse('Something went wrong', 500))
        }
    }
});

// @desc    GET single NGO
// @route   GET /api/v1/ngo/:id
// @access  Private
exports.getNGO = asyncHandler(async (req,res,next) => {
    const ngoId = req.params.id;
    const redisKey = `ngo${ngoId}`;

    // Check if the data is available in the Redis cache
    const ngoData = await getAsync(redisKey);

    

    if(ngoData){
        res.setHeader('Allow', 'GET');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(JSON.parse(ngoData));
    }else{

        const ngo = await NGO.findById(ngoId);

        if(!ngo){
            return next(new ErrorResponse(`NGO not found with id of ${ngoId}`, 404));
        }
    
        setexAsync(redisKey, 3600, JSON.stringify(ngo));

        res.setHeader('Allow', 'GET');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            code: 200,
            status: true,
            message: `Showing the NGO: ${ngo.name}`,
            Ngo: ngo
        })
    }
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

    delAsync('ngos');

    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
        code: 201,
        status: true,
        message: "NGO Created Successfully",
        data: ngo
    })
});

// @desc    PUT single NGO
// @route   PUT /api/v1/ngo/
// @access  Private
exports.updateNGO = asyncHandler(async (req,res,next) => {
    const ngoId = req.params.id;
    const redisKey = `ngo${ngoId}`;

    let ngo = await NGO.findById(ngoId)

    if(!ngo){
        return next(new ErrorResponse(`NGO not found with id of ${ngoId}`, 401));
    }

    if(ngo.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${ngoId} is not authorized to update this ngo`, 401))
    }

    ngo = await NGO.findByIdAndUpdate(ngoId, req.body, {
        new: true,
        runValidators: true
    })

    delAsync(redisKey);

    res.setHeader('Allow', 'PUT');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        status: true,
        data: ngo
    })
})

// @desc    DELETE single NGO
// @route   DELETE /api/v1/ngo/
// @access  Private
exports.deleteNGO = asyncHandler(async (req,res,next) => {
    const ngoId = req.params.id;
    const redisKey = `ngo${ngoId}`;

    const ngo = await NGO.findById(ngoId)

    if(!ngo){
        return next(new ErrorResponse(`NGO not found with id of ${ngoId}`, 401));
    }

    if(ngo.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${ngoId} is not authorized to delet this ngo`, 401))
    }

    await NGO.findByIdAndDelete(ngoId);

    delAsync(redisKey);

    res.setHeader('Allow', 'DELETE');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        status: true,
        msg: "Deleted Successfully"
    })
});

// @desc    GET NGO within a radius
// @route   GET /api/v1/ngo/radius/:zipcode/:distance
// @access  Private
exports.getNGOsInRadius = asyncHandler(async (req,res,next) => {
    const {zipcode, distance} = req.params

    //Get lat/lang from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radius calculation
    //Divide dist by Earth's radius 
    //Earth's Radius = 3963 miles/6378kms
    const radius = distance /3693;

    const ngo = await NGO.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        success: true,
        count: ngo.length,
        data: ngo
    })
});



