const asyncHandler = require("./async");

exports.setContentSecurityPolicy = asyncHandler(async (req, res, next) => {
    res.setHeader('content-security-policy',"default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; trusted-types default");
    next();
});