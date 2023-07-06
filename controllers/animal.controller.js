const Animal = require('../models/Animal');
const NGO = require('../models/Ngos')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const fs = require('fs')
const path = require('path')
const geocoder = require('../utils/geocoder')

// @desc    GET ALL Animals
// @route   GET /api/v1/animal
// @route   GET /api/v1/ngo/:ngoId/animals
// @access  Private
exports.getAnimals = asyncHandler(async (req,res,next)=>{
    let query;

        console.log(req.params)

        const reqQuery = {...req.query} 

        const removeFields = ['select','sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);


        let queryStr = JSON.stringify(reqQuery);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
        query = Animal.find(JSON.parse(queryStr))

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
        const total = await Animal.countDocuments();

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

        const animal = await query;


    
    if(req.params.ngoId){
        const ngo1 = await NGO.findById(req.params.ngoId);

        if (!ngo1)
        return next(
          new ErrorResponse(`NGO not found with ID of ${req.params.ngoId}`, 404)
        );

        query = Animal.find({ngo: req.params.ngoId}).populate('ngo', 'name description')
    }else{
        query = Animal.find().populate('ngo', 'name description')
    }

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    if(animal){
        res.status(200).json({
            code: 200,
            status: true,
            count: animal.length,
            pagination,
            data: animal
        })
    }else{
        return res.status(404).json({
            status: false
        })
    }
})

// @desc    GET single Animal
// @route   GET /api/v1/animal/:id
// @access  Private
exports.getAnimal = asyncHandler(async (req,res,next) => {
    const animal = await Animal.findById(req.params.id).populate('ngo', 'name description');
    
    if(!animal){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        status: true,
        message: "Details of Animal",
        data: animal
    })
});

// @desc    Create new Post for Animal
// @route   POST /api/v1/animal/
// @access  Private
exports.createAnimal = asyncHandler(async (req,res,next) => {
    req.body.user = req.user.id  
    
    const animal = await Animal.create(req.body);

    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
        status: true,
        data: animal
    })

});

// @desc    PUT single Animal Details
// @route   PUT /api/v1/animal/
// @access  Private
exports.updateAnimal = asyncHandler(async (req,res,next) => {
    let animal = await Animal.findById(req.params.id);

    if(animal.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this animal details`, 401))
    }

    if(!animal){
        return next(new ErrorResponse(`Animal not found with id of ${req.params.id}`, 404));
    }

    animal = await Animal.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });

    res.setHeader('Allow', 'PUT');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({
        code: 200,
        status: true,
        message: "Animal Details Updated Successfully",
        data: animal
    })
})

// @desc    DELETE single Animal
// @route   DELETE /api/v1/animal/
// @access  Private
exports.deleteAnimal = asyncHandler(async (req,res,next) => {
    const animal = await Animal.findById(req.params.id)

    if(animal.user.toString() !== req.user.id &&  req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this animal details`, 401))
    }

    if(!animal){
        return next(new ErrorResponse(`Animal not found with id of ${req.params.id}`, 404));
    }

    await Animal.findByIdAndDelete(req.params.id)

    res.setHeader('Allow', 'DELETE');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        status: true,
        msg: "Deleted Successfully",
        data: {}
    })
});

// @desc    GET Animal within a radius
// @route   GET /api/v1/animal/radius/:zipcode/:distance
// @access  Private
exports.getAnimalsInRadius = asyncHandler(async (req,res,next) => {
    const {zipcode, distance} = req.params

    //Get lat/lang from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radius calculation
    //Divide dist by Earth's radius 
    //Earth's Radius = 3963 miles/6378kms
    const radius = distance /3693;

    const animal = await Animal.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({
        code: 200,
        success: true,
        message: "Animals within the radius",
        count: animal.length,
        data: animal
    })

});


// @desc    PUT Animal in MGO
// @route   PUT /api/v1/animal/ngo/:ngoid
// @access  Private
exports.getAnimalsRescuedByNGO = asyncHandler(async (req,res,next) => {
    const ngo = await NGO.findById(req.params.ngoid);

    const animal = await Animal.findByIdAndUpdate(req.body.animalid, {
        $push: {ngo: ngo}
    },{
        new: true
    }).populate('ngo', 'name description')

    res.setHeader('Allow', 'PUT');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        code: 200,
        success: true,
        message: "Animal Rescued By The NGO",
        data: animal
    })

});
