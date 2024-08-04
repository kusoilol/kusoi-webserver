const SECRET = process.env.SECRET || 'development';

const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const router = express.Router();

const { Users } = require('../db')
const busboy = require("busboy");

function authorize(req, res, next) {
    if (!req.user) return next(createError(401));
    next();
}

router.get('/', async function(req, res) {
    res.status(200).render('index', { user: req.user });
});

router.get('/leaderboard', async function(req, res) {
    res.status(200).render('leaderboard', { user: req.user, users: Users.find() });
});

router.get('/login', async function(req, res) {
    res.status(200).render('login', { user: req.user, users: Users.find() });
});

router.post('/login', async function(req, res, next) {
    const user_id = Number(req.body.user_id);
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

router.get('/submissions', authorize, async function(req, res) {
    const submissions = [{ id: 1, code: "print('Hello World...')" }, { id: 2, code: "print('Hello World!')" }]; // Посылки нужно получать с другого сервера
    res.status(200).render('submissions', { user: req.user, submissions: submissions.toSorted((a, b) => b.id - a.id) });
});

router.post('/submit', authorize, async function(req, res) {
    const bb = busboy({ headers: req.headers });
    bb.on('file', function (fieldname, file, filename) {
        console.log(req.user.name);
        file.pipe(process.stdout);
    });
    bb.on('finish', function() {
        console.log('-----')
        res.redirect('/submissions');
    });
    return req.pipe(bb);
});

router.get('/user', authorize, async function(req, res) {
    res.status(200).render('user', { user: req.user });
});

module.exports = router;
