/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: session.js
 * Module: middlewares
 * Description: Authentication middleware
 */

const jwt = require('jsonwebtoken');

function signToken(nickname) {

    return jwt.sign({
        name: nickname
    }, process.env.TOKEN_SECRET)

}

module.exports.signToken = signToken;