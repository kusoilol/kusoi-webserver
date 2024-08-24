const BACKEND_URL = process.env.BACKEND_URL;

const authorize = require("../authorize");
const axios = require("axios");
const express = require("express");
const {Users} = require("../db");

const router = express.Router();

router.get('/', authorize, async function(req, res) {
    let data;
    try {
        const response = await axios.get(BACKEND_URL + '/game/list?team_id=' + req.user.id);
        data = response.data.map(el => {
            return {
                opponent_name: Users.findOne({ _id: el.opponent }).name,
                unixtime: Date.parse(el.timestamp),
                ...el,
            }
        });
    } catch (e) {
        data = [];
    }
    res.status(200).render('games/index', { user: req.user, games: data.toSorted((a, b) => b.unixtime - a.unixtime) });
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
