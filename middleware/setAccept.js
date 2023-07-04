const asyncHandler = require('../middleware/async')

exports.setAccept = asyncHandler(async (req,res,next)=>{
    req.headers.accept = 'application/json';
    next();
})