if (process.env.SERVER_PORT === undefined) process.env.SERVER_PORT = "8080";
if (process.env.SERVER_HOST === undefined) process.env.SERVER_HOST = "0.0.0.0";
if (process.env.SECRET === undefined) process.env.SECRET = "development";
if (process.env.BACKEND_URL === undefined) process.env.BACKEND_URL = "http://localhost:3000";
if (process.env.ADMIN_PASSWORD === undefined) process.env.ADMIN_PASSWORD = "admin";

const SERVER_PORT = Number(process.env.SERVER_PORT);
const SERVER_HOST = process.env.SERVER_HOST;
const SECRET = process.env.SECRET;

const index_router = require('./routers/index');
const admin_router = require('./routers/admin');
const solution_router = require('./routers/solution');
const games_router = require('./routers/games');
const express = require('express');
const cookieParser = require('cookie-parser')
const nunjucks = require('nunjucks');
const awaitFilter = require('nunjucks-await-filter');
const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const logger = require('morgan');
const createError = require('http-errors');
const path = require("path");
const {Users} = require("./db");
const fileUpload = require('express-fileupload');
require('./tournament_task');


// App setup

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'static')));
app.use(fileUpload())

// JWT setup

const UserJwtStrategyOptions = {
    jwtFromRequest: (req) => (req && req.cookies) ? req.cookies['jwt'] : undefined,
    secretOrKey: SECRET
};

const AdminJwtStrategyOptions = {
    jwtFromRequest: (req) => (req && req.cookies) ? req.cookies['admin_jwt'] : undefined,
    secretOrKey: SECRET
};

passport.use('userJWT', new JwtStrategy(UserJwtStrategyOptions, function(jwt_payload, done) {
    const user = Users.findOne({ _id: jwt_payload.id });
    return done(null, user);
}));

passport.use('adminJWT', new JwtStrategy(AdminJwtStrategyOptions, function(jwt_payload, done) {
    return done(null, jwt_payload);
}));

const authorize = function(req, res, next) {
    passport.authenticate('userJWT', (err, user) => {
        req.user = user || null;
        if (req.user) req.user.id = user._id;
        next();
    })(req, res, next);
};

const authorizeAdmin = function(req, res, next) {
    passport.authenticate('adminJWT', (err, payload) => {
        req.isAdmin = payload.isAdmin || false;
        next();
    })(req, res, next);
};

app.use(authorize);
app.use(authorizeAdmin);

// Nunjucks setup

const nunjucksEnv = nunjucks.configure(['views'], {
    autoescape: true,
    express: app
});
awaitFilter(nunjucksEnv);
app.set('view engine', 'njk');

// Routers

app.use('/', index_router);
app.use('/admin/', admin_router);
app.use('/solutions/', solution_router);
app.use('/games/', games_router);

// Error handling

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).render('error', { user: req.user, err });
});

// Start

app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server is up and running on ${SERVER_HOST}:${SERVER_PORT}`);
});
