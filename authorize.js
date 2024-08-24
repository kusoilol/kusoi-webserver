const createError = require("http-errors");

function authorize(req, res, next) {
    if (!req.user) return next(createError(401));
    next();
}

module.exports = authorize;
