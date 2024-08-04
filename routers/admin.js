const express = require('express');
const router = express.Router();
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {Users} = require("../db");

const SECRET = process.env.SECRET || 'development';
const ADMIN_PASSWORD = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 10);

const authorizeAdmin = function(req, res, next) {
    if (!req.isAdmin) return res.status(401).redirect('/admin/auth')
    next();
}

router.get('/auth', function(req, res) {
    res.status(200).render('admin/auth', { user: req.user });
});

router.post('/auth', function(req, res) {
    if (bcrypt.compareSync(req.body['admin-password'], ADMIN_PASSWORD))
        res.cookie('admin_jwt', JWT.sign({ isAdmin: true }, SECRET));
    res.redirect('/admin');
});

router.get('/', authorizeAdmin, function(req, res) {
    res.status(200).render('admin/index', { user: req.user, users: Users.find().toSorted((a, b) => a._id - b._id) });
});

router.post('/edit', authorizeAdmin, function(req, res) {
    const { id, name, new_password } = req.body;
    Users.update({ _id: Number(id) }, { name }).save();
    if (new_password) Users.update({ _id: Number(id) }, { passwordHash: bcrypt.hashSync(new_password, 10) }).save();
    res.redirect('/admin');
});

router.get('/delete', authorizeAdmin, function(req, res) {
    Users.remove({ _id: Number(req.query.id) });
    res.redirect('/admin');
});

router.get('/new', authorizeAdmin, function(req, res) {
    const _id = Math.max(0, ...(Users.find().map((e) => e._id))) + 1;
    Users.create({ _id, name: 'user' + _id, passwordHash: bcrypt.hashSync("12345", 10)}).save();
    res.redirect('/admin');
});

module.exports = router;
