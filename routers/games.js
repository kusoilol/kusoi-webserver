const BACKEND_URL = process.env.BACKEND_URL;

const authorize = require("../authorize");
const axios = require("axios");
const express = require("express");

const router = express.Router();

router.get('/', authorize, async function(req, res) {
    let response;
    try {
        response = await axios.get(BACKEND_URL + '/game/list?team_id=' + req.user.id);
    } catch (e) {
        response = { data: null };
    }
    res.status(200).render('games/index', { user: req.user, games: response.data });
});

router.get('/local', authorize, async function(req, res) {
    res.status(200).render('games/local', { user: req.user });
});

router.post('/local', authorize, async function(req, res) {
    res.status(404).end();
});

router.get('/:gameId', authorize, async function(req, res) {
    const { gameId } = req.params;
    let response;
    try {
        response = await axios.get(BACKEND_URL + '/game?game_id=' + gameId);
    } catch (e) {
        response = { data: null };
    }
    res.status(200).render('games/view', { user: req.user, gameLog: response.data });
});

module.exports = router;
