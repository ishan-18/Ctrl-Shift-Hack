const asyncHandler = require("./async");

exports.setGzip = asyncHandler(async (req, res, next) => {
    req.headers['content-encoding'] = 'gzip'
    next();
});