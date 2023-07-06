const mongoose = require('mongoose')
const geocoder = require('../utils/geocoder')
const { v4: uuidv4 } = require('uuid');

const AnimalSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4()
    },
    animal_species: {
        type: String,
        trim: true,
        required: [true, "Please add a species"]
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    address: {
        type: String,
        required: [true, 'Please add a address']
    },
    location: {
        type: {
          type: String,
          enum: ['Point'], 
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
    },
    photo: {
        type: String,
        default: 'no-photo'
    },
    vaccinated: {
        type: Boolean,
        default: false
    },
    rescue_priority: {
        type: String,
        enum: ['High', 'Low', "Medium"],
        required: [true,'Please add a risk'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    ngo: {
        type: String,
        ref: 'NGO'
    },
    user: {
        type: String,
        ref: 'User'
    },
},{
    toJSON: { virtuals: true },
    toObject: {virtuals: true}
})

AnimalSchema.pre('save', async function(next){
    
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    //Do not save address in DB 
    
    next();
})

module.exports = mongoose.model('Animal', AnimalSchema)