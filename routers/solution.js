const axios = require("axios");
const authorize = require("../authorize");
const express = require("express");
const SERVER_URL = process.env.SERVER_URL;

const router = express.Router();

router.get('/', authorize, async function(req, res) {
    let response, solutions = [];
    try {
        response = await axios.get(SERVER_URL + '/solutions/last?team_id=' + req.user.id);
        const [last_id, cur_id] = response.data;
        for (i = 1; i <= last_id; i++) {
            solutions.push({ id: i })
        }
    } catch (e) {
        solutions = [{ id: 1 }];
    }
    res.status(200).render('solutions', { user: req.user, solutions: solutions.toSorted((a, b) => b.id - a.id) });
});

router.get('/current', authorize, async function(req, res) {
    let response;
    try {
        response = await axios.get(SERVER_URL + '/solutions?team_id=' + req.user.id);
    } catch (e) {
        response = { data: "No connection to backend." }
    }

    res.status(200).render('solution', { user: req.user, code: response.data });
});

router.get('/:solutionId', authorize, async function(req, res) {
    const { solutionId } = req.params;
    let response;
    try {
        response = await axios.get(SERVER_URL + '/solutions?team_id=' + req.user.id + '&solutionId=' + solutionId);
    } catch (e) {
        response = { data: "No connection to backend." }
    }
    res.status(200).render('solution', { user: req.user, code: response.data });
});


module.exports = router;
