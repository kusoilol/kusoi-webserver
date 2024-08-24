const dbLocal = require("db-local");
const bcrypt = require("bcrypt");

let Users;

if (Users === undefined) {
    const { Schema } = new dbLocal({ path: "./databases" });

    Users = Schema("Users", {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        passwordHash: { type: String, required: true },
        score: { type: Number, required: true, default: 0 },
        score_delta: { type: Number, required: true, default: 0 }
    });
}

module.exports = { Users };
