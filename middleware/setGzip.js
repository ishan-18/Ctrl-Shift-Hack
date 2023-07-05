const asyncHandler = require("./async");

exports.setGzip = asyncHandler(async (req, res, next) => {
    req.headers['accept-encoding'] = 'gzip'
    next();
});