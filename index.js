const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;
const SERVER_HOST = process.env.HOST || '0.0.0.0';
const SECRET = process.env.SECRET || 'development';

const index_router = require('./routers/index');
const express = require('express');
const cookieParser = require('cookie-parser')
const nunjucks = require('nunjucks');
const awaitFilter = require('nunjucks-await-filter');
const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const logger = require('morgan');
const createError = require('http-errors');
const path = require("path");

// App setup

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'static')));

// JWT setup

const JwtStrategyOptions = {
    jwtFromRequest: (req) => (req && req.cookies) ? req.cookies['jwt'] : undefined,
    secretOrKey: SECRET
};

passport.use(new JwtStrategy(JwtStrategyOptions, function(jwt_payload, done) {
    return done(null, jwt_payload);
}));

const authorize = function(req, res, next) {
    passport.authenticate('jwt', (err, user) => {
        req.user = user || null;
        next();
    })(req, res, next);
};

app.use(authorize);

// Nunjucks setup

const nunjucksEnv = nunjucks.configure(['views'], {
    autoescape: true,
    express: app
});
awaitFilter(nunjucksEnv);
app.set('view engine', 'njk');

// Routers

app.use('/', index_router);

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
