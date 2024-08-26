const SECRET = process.env.SECRET;
const BACKEND_URL = process.env.BACKEND_URL;

const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const authorize = require("../authorize");
const { Users } = require('../db')
const axios = require("axios");

const router = express.Router();

router.get('/', async function(req, res) {
    res.status(200).render('index', { user: req.user });
});

router.get('/leaderboard', async function(req, res) {
    let users = Users.find();
    for (let i = 0; i < users.length; i++) {
        try {
            const req = await axios.get(BACKEND_URL + '/tournament/score?team_id=' + users[i]._id)
            users[i].score = req.data;
        } catch (e) {
            res.redirect('/');
            return;
        }
    }
    res.status(200).render('leaderboard', { user: req.user, users });
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

router.get('/user', authorize, async function(req, res) {
    res.status(200).render('user', { user: req.user });
});

module.exports = router;
