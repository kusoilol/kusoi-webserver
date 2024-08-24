const BACKEND_URL = process.env.BACKEND_URL;

const authorize = require("../authorize");
const axios = require("axios");
const express = require("express");

const router = express.Router();

router.get('/gameview', authorize, async function(req, res) {
    const { gameId } = req.params;
    let response;
    try {
        response = await axios.get(BACKEND_URL + '/gamelog?gameId=' + gameId);
    } catch (e) {
        response = { data: "No connection to backend." }
    }
    res.status(200).render('gameview', { user: req.user, gameLog: response.data });
});

router.get('/gameview/:gameId', authorize, async function(req, res) {
    const { gameId } = req.params;
    let response;
    try {
        response = await axios.get(BACKEND_URL + '/gamelog?gameId=' + gameId);
    } catch (e) {
        response = { data: "No connection to backend." }
    }
    res.status(200).render('gameview', { user: req.user, gameLog: response.data });
});

module.exports = router;
