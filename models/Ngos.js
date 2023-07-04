const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder')
const { v4: uuidv4 } = require('uuid');

const NgoSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4()
    },
    name: {
        type: String,
        required: [true, "Please Add a name"],
        unique: true,
        trim: true,
        maxLength: [50, "Name cannot exceed 50 characters"]
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
        required: [true, "Please Add a description"],
        maxLength: [500, "Name cannot exceed 500 characters"]
    },
    website: {
        type: String,
        unique: true,
        required: [true, "Please Add a Website"],
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please enter a valid URL with HTTP or HTTPS'],
    },
    phone: {
        type: String,
        maxLength: [20, "Please Enter a valid Phone Number"],
        required: [true, "Please Add a Phone Number"],
    },
    email: {
        type: String,
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
        required: [true, "Please Add a Email Address"],
    },
    address: {
        type: String,
        required: [true, "Please add an address"]
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
    goals: {
        type: [String],
        required: [true, "Please add a Goal"],
        enum: [
            'Nurture Animals',
            'Treating Diseased Animals',
        ],
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be atleast 1"],
        max: [10,"Rating must not be more than 10"]
    },
    photo: {
        type: String,
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCIBX-sNqXAqG-Tua98DZ8WFobwS7s6IExqvmjMCCJpHOltCCA9j3F7J8YYfrNrShQVg4&usqp=CAU'
    },
    user: {
        type: String,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: { virtuals: true },
    toObject: {virtuals: true}
});

NgoSchema.pre('save', function(next){
    this.slug = slugify(this.name,{lower: true})
    next();
})

NgoSchema.pre('save', async function(next){
    
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
    this.address = undefined
    
    next();
})


module.exports = mongoose.model('NGO', NgoSchema);