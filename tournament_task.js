const axios = require('axios');
const {Users} = require("./db");

const BACKEND_URL = process.env.BACKEND_URL;
const tournamentStart = new Date('2024-08-25T08:50:00.000Z')

console.log('First tournament in', tournamentStart - Date.now());
module.exports = setTimeout(() => {
    setInterval(async () => {
        console.log('Running tournament');
        try {
            await axios.post(BACKEND_URL + '/tournament/', [
                ...Users.find().map(user => user._id),
            ]);
        } catch (e) {}
    }, 5 * 60 * 1000)
}, tournamentStart - Date.now())
