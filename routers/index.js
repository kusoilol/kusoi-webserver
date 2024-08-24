const SECRET = process.env.SECRET;
const SERVER_URL = process.env.SERVER_URL;

const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const authorize = require("../authorize");
const { Users } = require('../db')
const busboy = require("busboy");
const axios = require("axios");

const router = express.Router();

router.get('/', async function(req, res) {
    res.status(200).render('index', { user: req.user });
});

router.get('/leaderboard', async function(req, res) {
    res.status(200).render('leaderboard', { user: req.user, users: Users.find() });
});

router.get('/tournament', async function(req, res) {
    res.status(200).render('tournament', { user: req.user, users: Users.find() });
});

router.get('/customtest', async function(req, res) {
    res.status(200).render('customtest', { user: req.user });
});

router.get('/login', async function(req, res) {
    res.status(200).render('login', { user: req.user, users: Users.find() });
});

router.post('/login', async function(req, res, next) {
    const user_id = req.body.user_id;
    const user = Users.findOne({ _id: user_id });

    if (user === undefined || !bcrypt.compareSync(req.body.password, user.passwordHash))
        return next(createError(401));

    const token = JWT.sign({ name: user.name, id: user._id }, SECRET, { expiresIn: '6h' });
    res.cookie("jwt", token);
    res.redirect("/leaderboard");
});

router.get('/logout', async function(req, res) {
    res.cookie("jwt", "");
    res.redirect('/login');
});

router.post('/submit', authorize, async function(req, res) {
    const bb = busboy({ headers: req.headers });
    bb.on('file', function (fieldname, file, filename) {
        console.log(req.user.name);
        file.pipe(process.stdout);
    });
    bb.on('finish', function() {
        console.log('-----')
        res.redirect('/solutions');
    });
    return req.pipe(bb);
});

router.get('/user', authorize, async function(req, res) {
    res.status(200).render('user', { user: req.user });
});

router.get('/gameview/:gameId', authorize, async function(req, res) {
    const { gameId } = req.params;
    let response;
    try {
        response = await axios.get(SERVER_URL + '/gamelog?gameId=' + gameId);
    } catch (e) {
        response = { data: "No connection to backend." }
    }
    res.status(200).render('gameview', { user: req.user, gameLog: response.data });
});



module.exports = router;
